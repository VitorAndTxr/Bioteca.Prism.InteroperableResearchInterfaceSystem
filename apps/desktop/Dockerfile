# Multi-stage Dockerfile for IRIS Desktop (Web mode)
# Build context must be the IRIS monorepo root (../../)

# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copy root package files and tsconfig for workspace resolution
COPY package.json package-lock.json tsconfig.json ./

# Copy workspace package.json files
COPY apps/desktop/package.json apps/desktop/
COPY packages/domain/package.json packages/domain/
COPY packages/middleware/package.json packages/middleware/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy shared packages source
COPY packages/domain/ packages/domain/
COPY packages/middleware/ packages/middleware/

# Copy desktop app source
COPY apps/desktop/ apps/desktop/

# Copy the appropriate env file as .env.production for Vite
ARG VITE_ENV_FILE=apps/desktop/.env.production
COPY ${VITE_ENV_FILE} apps/desktop/.env.production

ARG VITE_BASE_PATH=./
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

WORKDIR /app/apps/desktop
RUN npm run build:renderer

# ── Serve stage ──────────────────────────────────────────────
FROM nginx:alpine AS serve

ARG NGINX_BASE_PATH=/

# Generate nginx config with the correct base path
RUN echo "server {" > /etc/nginx/conf.d/default.conf && \
    echo "    listen 80;" >> /etc/nginx/conf.d/default.conf && \
    echo "    server_name _;" >> /etc/nginx/conf.d/default.conf && \
    echo "    root /usr/share/nginx/html;" >> /etc/nginx/conf.d/default.conf && \
    echo "    index index.html;" >> /etc/nginx/conf.d/default.conf && \
    echo "" >> /etc/nginx/conf.d/default.conf && \
    echo "    location ${NGINX_BASE_PATH} {" >> /etc/nginx/conf.d/default.conf && \
    echo "        alias /usr/share/nginx/html/;" >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo "    }" >> /etc/nginx/conf.d/default.conf && \
    echo "" >> /etc/nginx/conf.d/default.conf && \
    echo '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {' >> /etc/nginx/conf.d/default.conf && \
    echo "        expires 1y;" >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf && \
    echo "    }" >> /etc/nginx/conf.d/default.conf && \
    echo "}" >> /etc/nginx/conf.d/default.conf

COPY --from=build /app/apps/desktop/dist/renderer /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
