# syntax=docker/dockerfile:1

# ==========================================================
#  Uber Data Platform — Frontend SPA
#  Stage 1 builds the Vite bundle; stage 2 serves it with nginx.
#
#  Build context is ./frontend:
#      docker build -f frontend/Dockerfile -t uber-frontend ./frontend
# ==========================================================

# ----------------------------------------------------------
#  Stage 1 — build
# ----------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Dependencies first, for layer caching
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund \
 && npm cache clean --force

COPY . .

# Vite inlines import.meta.env values at BUILD time, so the API base URL is
# baked into the bundle and cannot be changed by runtime env vars.
#   http://localhost:5000  → browser calls the API directly (default, matches dev)
#   /                      → same-origin through the nginx proxy above
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Runs `tsc -b && vite build`
RUN npm run build

# ----------------------------------------------------------
#  Stage 2 — serve
# ----------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Our own server block replaces the image default
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
