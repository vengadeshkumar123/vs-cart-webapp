# VS Cart — React + Express + MySQL

A demo e-commerce application with customer registration/login, product search/filter/sort, cart, checkout, order tracking, and admin product/order management.

## Application stack
- Frontend: React + Vite, served by Nginx in its own container
- Backend: Node.js + Express API in its own container
- Database: MySQL 8 / Amazon RDS MySQL
- Authentication: bcrypt password hashing + JWT
- Production containers: two independent Docker images; Docker Compose is not used for AWS deployment

## AWS deployment

This copy is configured for the AWS practice environment in `ap-south-1`:
- Jenkins EC2 builds two images from `client/Dockerfile` and `server/Dockerfile`.
- Amazon ECR repositories: `vscart-frontend` and `vscart-backend`.
- Ubuntu App EC2 runs one frontend container and one backend container.
- Amazon RDS MySQL stores application data.
- Internet-facing Application Load Balancer receives HTTP on port 80. It forwards `/api/*` to backend target group (App EC2 port 5000) and all other paths to frontend target group (App EC2 port 8080).
- Frontend Nginx serves the React build. The browser calls `/api` on the same ALB hostname; the ALB sends those requests to Express.
- Backend health endpoint: `/api/health`.

See `DEVOPS.md` for AWS resource values, security group requirements, RDS setup, Jenkins IAM permissions and deployment sequence.

## Local development

Use the npm scripts in the root `package.json` to run the frontend and backend separately. The Vite development server proxies `/api` to `http://localhost:5000`. The optional `docker-compose.yml` is for local multi-container practice only; AWS deployment does not push or use it.

## Important safety notes
- Never commit `.env`, database passwords, AWS keys or SSH private keys.
- Use the App EC2 IAM role for ECR image pulls and the Jenkins EC2 IAM role for ECR pushes.
- Do not expose RDS publicly.
- The demo seed script resets demo data. Review it and only run it against a fresh practice database.
