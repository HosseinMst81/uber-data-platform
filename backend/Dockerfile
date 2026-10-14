# syntax=docker/dockerfile:1

# ==========================================================
#  Uber Data Platform — Backend API
#  Express 5 + node-postgres, plus the Bronze/Silver/Gold ETL scripts
#
#  Build context is the REPOSITORY ROOT (not ./backend) because the Bronze
#  importer needs ./database/original_dataset.csv:
#      docker build -f backend/Dockerfile -t uber-backend .
# ==========================================================
FROM node:20-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app/backend

# --- Dependencies -------------------------------------------------------
# Copied separately so this layer is cached while only source changes.
# `npm ci` installs the exact tree from package-lock.json.
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
 && npm cache clean --force

# --- Application source -------------------------------------------------
COPY backend/src ./src

# --- Dataset for the Bronze ETL stage -----------------------------------
# import_bronze.js resolves it as <repo>/database/original_dataset.csv
COPY database /app/database

# node:20-alpine ships a non-root `node` user (uid/gid 1000)
USER node

EXPOSE 5000

# TCP readiness probe — no curl/wget package needed
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "const s=require('net').connect(5000,'127.0.0.1');s.on('connect',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1))"

CMD ["node", "src/index.js"]
