#!/usr/bin/env bash
# One-time setup for the Ubuntu App EC2. Run: sudo bash deploy/ec2-setup.sh
set -euo pipefail
APP_USER="ubuntu"
APP_DIR="/opt/vscart"
RDS_ENDPOINT="vscart-mysql.chm66cwwq0k7.ap-south-1.rds.amazonaws.com"

apt-get update
if ! command -v docker >/dev/null 2>&1; then apt-get install -y docker.io; fi
if ! command -v aws >/dev/null 2>&1; then apt-get install -y awscli; fi
apt-get install -y curl openssl
systemctl enable --now docker
usermod -aG docker "${APP_USER}"
mkdir -p "${APP_DIR}"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}"

if [ ! -f "${APP_DIR}/.env" ]; then
  cat > "${APP_DIR}/.env" <<ENVEOF
NODE_ENV=production
PORT=5000
DB_HOST=${RDS_ENDPOINT}
DB_PORT=3306
DB_SSL=true
DB_SSL_CA=/etc/ssl/certs/rds-global-bundle.pem
DB_USER=CHANGE_ME_DB_USER
DB_PASSWORD=CHANGE_ME_DB_PASSWORD
DB_NAME=vscart
DB_POOL_SIZE=10
JWT_SECRET=$(openssl rand -hex 32)
ENVEOF
  chmod 600 "${APP_DIR}/.env"
  echo "Created ${APP_DIR}/.env. Set DB_USER and DB_PASSWORD to your rotated application DB credentials."
else
  echo "${APP_DIR}/.env already exists; leaving it unchanged."
fi
chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env"
chmod 600 "${APP_DIR}/.env"
echo "App EC2 setup completed. RDS endpoint configured: ${RDS_ENDPOINT}"
echo "Edit ${APP_DIR}/.env before deployment. Never put DB passwords or private keys in Git."
echo "Log out and reconnect so ubuntu's docker group membership takes effect."
