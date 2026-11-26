# Build the React + Vite frontend.
FROM node:20-alpine AS build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --no-audit --no-fund
COPY client/ ./

ENV VITE_API_URL=/api
RUN npm run build

# Serve the static production build with Nginx.
FROM nginx:1.27-alpine
COPY client/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
