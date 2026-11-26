#!/usr/bin/env bash
# Deploy two ECR images to the Ubuntu App EC2.
# Usage: deploy.sh <frontend-image:tag> <backend-image:tag> [aws-region]
set -euo pipefail
FRONTEND_IMAGE="${1:?Usage: deploy.sh <frontend-image:tag> <backend-image:tag> [region]}"
BACKEND_IMAGE="${2:?Missing backend image URI}"
REGION="${3:-ap-south-1}"
FRONTEND_APP="vscart-frontend"
BACKEND_APP="vscart-backend"
ENV_FILE="/opt/vscart/.env"
NETWORK="vscart-net"
FRONTEND_HOST_PORT="8080"
BACKEND_HOST_PORT="5000"

[ -f "${ENV_FILE}" ] || { echo "Missing ${ENV_FILE}; run deploy/ec2-setup.sh and configure DB credentials first." >&2; exit 1; }
if grep -q 'CHANGE_ME' "${ENV_FILE}"; then
  echo "Replace CHANGE_ME database credentials in ${ENV_FILE} before deployment." >&2
  exit 1
fi

aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${FRONTEND_IMAGE%%/*}"
docker pull "${FRONTEND_IMAGE}"
docker pull "${BACKEND_IMAGE}"

PREV_FRONTEND="$(docker inspect -f '{{.Config.Image}}' "${FRONTEND_APP}" 2>/dev/null || true)"
PREV_BACKEND="$(docker inspect -f '{{.Config.Image}}' "${BACKEND_APP}" 2>/dev/null || true)"
docker network inspect "${NETWORK}" >/dev/null 2>&1 || docker network create "${NETWORK}" >/dev/null

start_containers() {
  local frontend_image="$1" backend_image="$2"
  docker run -d --name "${BACKEND_APP}" --restart unless-stopped \
    --network "${NETWORK}" -p "${BACKEND_HOST_PORT}:5000" \
    --env-file "${ENV_FILE}" "${backend_image}" >/dev/null
  docker run -d --name "${FRONTEND_APP}" --restart unless-stopped \
    --network "${NETWORK}" -p "${FRONTEND_HOST_PORT}:80" \
    "${frontend_image}" >/dev/null
}

healthy() {
  for _ in $(seq 1 40); do
    if curl -fsS "http://127.0.0.1:${BACKEND_HOST_PORT}/api/health" >/dev/null \
      && curl -fsS "http://127.0.0.1:${FRONTEND_HOST_PORT}/" >/dev/null; then
      return 0
    fi
    sleep 3
  done
  return 1
}

remove_current() {
  docker rm -f "${FRONTEND_APP}" "${BACKEND_APP}" >/dev/null 2>&1 || true
}

remove_current
if start_containers "${FRONTEND_IMAGE}" "${BACKEND_IMAGE}" && healthy; then
  echo "Deployment successful. Frontend: ${FRONTEND_IMAGE} Backend: ${BACKEND_IMAGE}"
  exit 0
fi

echo "New deployment failed. Container logs:" >&2
docker logs --tail 80 "${FRONTEND_APP}" >&2 || true
docker logs --tail 80 "${BACKEND_APP}" >&2 || true
remove_current

if [ -n "${PREV_FRONTEND}" ] && [ -n "${PREV_BACKEND}" ]; then
  echo "Rolling back both containers..." >&2
  if start_containers "${PREV_FRONTEND}" "${PREV_BACKEND}" && healthy; then
    echo "Rollback completed." >&2
  else
    echo "Rollback containers also failed health checks." >&2
    docker logs --tail 80 "${FRONTEND_APP}" >&2 || true
    docker logs --tail 80 "${BACKEND_APP}" >&2 || true
  fi
else
  echo "No complete previous frontend/backend deployment was found for rollback." >&2
fi
exit 1
