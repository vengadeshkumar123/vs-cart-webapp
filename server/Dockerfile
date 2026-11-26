FROM node:20-alpine

RUN apk add --no-cache ca-certificates curl \
    && curl -fsSL https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
       -o /etc/ssl/certs/rds-global-bundle.pem \
    && chmod 0644 /etc/ssl/certs/rds-global-bundle.pem

ENV NODE_ENV=production PORT=5000
WORKDIR /app
COPY server/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund \
    && npm cache clean --force
COPY server/ ./
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1
CMD ["node", "server.js"]
