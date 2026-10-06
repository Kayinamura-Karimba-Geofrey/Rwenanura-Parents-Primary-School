# Production image: builds the frontend, then runs the API server, which also
# serves the built site. The SQLite database lives in a volume.
#
#   docker build -t rpps .
#   docker run -d --name rpps -p 5000:5000 --env-file .env -v rpps-data:/app/server/data rpps

# --- Build the frontend -------------------------------------------------------
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime ------------------------------------------------------------------
FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY scripts ./scripts
COPY --from=build /app/dist ./dist

# Run as the unprivileged "node" user; only the data folder is writable
RUN mkdir -p /app/server/data && chown -R node:node /app/server/data
USER node
VOLUME ["/app/server/data"]
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/index.js"]
