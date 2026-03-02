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

WORKDIR /app/apps/desktop
RUN npm run build:renderer

# ── Serve stage ──────────────────────────────────────────────
FROM nginx:alpine AS serve

COPY apps/desktop/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/desktop/dist/renderer /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
