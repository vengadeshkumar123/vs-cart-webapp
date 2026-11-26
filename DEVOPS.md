# VS Cart — AWS Deployment Guide (Two Docker Images, No Compose)

This project is configured for the VS Cart practice deployment in `ap-south-1`. AWS production deployment uses two independent Docker images and two containers on the existing App EC2. Docker Compose is not used or uploaded for deployment.

## Target architecture

GitHub -> Jenkins EC2 -> build frontend and backend images -> Amazon ECR (`vscart-frontend`, `vscart-backend`) -> Ubuntu App EC2 runs two containers -> Amazon RDS MySQL.

Public traffic: Internet -> `vscart-alb` HTTP:80. The ALB listener uses a path rule: `/api/*` forwards to backend target group (`vscart-backend-tg`, HTTP:5000); the default action forwards to the existing frontend target group (`vscart-app-tg`, HTTP:8080). Frontend Nginx serves the React static build. Browser API requests use the same hostname with `/api`, and ALB routes them to Express. Backend connects to private RDS MySQL on port 3306.

## Configured AWS values

| Resource | Value |
|---|---|
| Region | `ap-south-1` |
| AWS account | `113056210430` |
| Frontend ECR repository | `vscart-frontend` |
| Backend ECR repository | `vscart-backend` |
| ECR registry | `113056210430.dkr.ecr.ap-south-1.amazonaws.com` |
| Jenkins EC2 | `vscart-jenkins-server` |
| App EC2 | `vscart-app-server` |
| App EC2 private IP | `10.0.27.118` |
| App EC2 SSH user | `ubuntu` |
| RDS endpoint | `vscart-mysql.chm66cwwq0k7.ap-south-1.rds.amazonaws.com` |
| Database name | `vscart` |
| RDS port | `3306` |
| ALB | `vscart-alb` |
| Frontend target group | Existing `vscart-app-tg` (HTTP:8080) |
| Backend target group | `vscart-backend-tg` (HTTP:5000) |
| Frontend container port | `80` |
| Backend container port | `5000` |
| Backend health endpoint | `/api/health` |

## Required security group rules

- ALB SG: inbound HTTP 80 from the internet.
- App SG: inbound TCP 8080 from the ALB SG (frontend container).
- App SG: inbound TCP 5000 from the ALB SG (backend container).
- App SG: inbound SSH 22 from the Jenkins SG so Jenkins can deploy over the VPC private IP. Never open SSH to `0.0.0.0/0`.
- RDS SG: inbound MySQL 3306 from the App SG only.
- Jenkins SG: keep SSH and Jenkins web access restricted to the administrator's IP or approved access source.

## 1. Prepare the ECR repositories and IAM permissions

Create two private ECR repositories in `ap-south-1`, both with image scanning on push:
- `vscart-frontend`
- `vscart-backend`

The Jenkins EC2 instance profile must allow `ecr:GetAuthorizationToken` on `*`, and these image actions on both repository ARNs: `ecr:BatchCheckLayerAvailability`, `ecr:CompleteLayerUpload`, `ecr:InitiateLayerUpload`, `ecr:PutImage`, and `ecr:UploadLayerPart`. The exact replacement policy is included at `deploy/jenkins-ecr-push-policy.json`; update the existing Jenkins role policy to include both new repository ARNs. The App EC2 role can retain `AmazonEC2ContainerRegistryReadOnly`, which covers both repositories.

## 2. Prepare the RDS database

Connect from the App EC2 (or another approved host in the VPC) using the RDS master account, then create the application database and a dedicated application user. Do not use the RDS master account in the application.

Example SQL; use a new strong password that has not been exposed in chat or committed to Git:

```sql
CREATE DATABASE IF NOT EXISTS vscart;
CREATE USER IF NOT EXISTS 'vscart_app'@'%' IDENTIFIED BY 'REPLACE_WITH_A_NEW_STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX
ON vscart.* TO 'vscart_app'@'%';
FLUSH PRIVILEGES;
```

If `vscart_app` already exists, rotate its password with `ALTER USER` rather than relying on `CREATE USER IF NOT EXISTS`. The app creates its tables at startup, so the initial app user needs table-creation privileges. Keep the RDS SG restricted to the App EC2 SG. The backend image includes the AWS RDS global CA bundle and uses verified TLS (`DB_SSL=true`, `DB_SSL_CA=/etc/ssl/certs/rds-global-bundle.pem`).

## 3. Prepare the App EC2

The App EC2 is Ubuntu. Transfer `deploy/ec2-setup.sh` to the App EC2 and run:

```bash
sudo bash deploy/ec2-setup.sh
```

Edit `/opt/vscart/.env` and set `DB_USER` to `vscart_app` and `DB_PASSWORD` to the newly rotated application DB password. The script sets the RDS endpoint, database name, port and a generated JWT secret. Keep `.env` private (mode 600); never commit it to Git. The RDS CA bundle is inside the backend image, so the host does not need a separate CA file.

The script adds `ubuntu` to the Docker group. Log out and reconnect so the new group membership is active.

## 4. Configure Jenkins

Install/enable Jenkins plugins: Pipeline, Git and SSH Agent. Configure a Jenkins SSH credential:
- Kind: SSH Username with private key
- ID: `ec2-ssh-key`
- Username: `ubuntu`
- Private key: the private key corresponding to the `vscart-app-key` key pair used by App EC2. Add it inside Jenkins; never share it in chat or commit it.

Jenkins must reach App EC2 private IP `10.0.27.118` over TCP 22. Add an App SG inbound rule for SSH 22 sourced from the Jenkins SG. Do not expose SSH to the internet. The Jenkins EC2 IAM role needs ECR push permissions for both repositories listed above.

## 5. Jenkins pipeline

The Jenkinsfile checks out the source, builds the frontend image using `client/Dockerfile` and backend image using `server/Dockerfile`, performs basic Nginx and Node syntax checks, logs in to ECR, pushes both build tags plus `latest`, and SSHes to App EC2. The deployment script runs the backend container on host port 5000 and frontend Nginx container on host port 8080. Both containers join a Docker network named `vscart-net`; no Compose file is needed.

## 6. ALB listener and target groups

Reuse the existing `vscart-app-tg` as the frontend target group: keep target type **Instances**, protocol HTTP, port 8080, VPC `vscart-vpc`, and change its health check path to `/` (success code 200). Create one additional target group named `vscart-backend-tg`, target type **Instances**, protocol HTTP, port 5000, same VPC, health check path `/api/health` (success code 200).

Register the same App EC2 instance in both target groups, using the matching port for each. In the ALB HTTP:80 listener, add a rule with path pattern `/api/*` forwarding to `vscart-backend-tg`. Keep the default action forwarding to the existing `vscart-app-tg` frontend target group. The health check for each target group probes its registered port directly, independently of the listener rule.

## 7. Useful checks

On App EC2:

```bash
docker ps
docker logs --tail 100 vscart-frontend
docker logs --tail 100 vscart-backend
curl -f http://127.0.0.1:8080/
curl -f http://127.0.0.1:5000/api/health
```

In AWS, confirm both ECR repositories contain the pushed images, both target groups report the App EC2 healthy, the ALB listener path rule is present, and RDS remains private with inbound MySQL only from the App SG. Use the ALB DNS name as the public entry point.

## 8. Cost and cleanup

EC2, RDS, ALB, EBS and data transfer can incur charges. Stop practice instances when idle where appropriate, and delete the ALB and other resources when the project is finished. Stopping EC2 does not stop EBS storage charges; stopped RDS instances can automatically restart after the supported stop period. Check Billing and Cost Explorer regularly.
