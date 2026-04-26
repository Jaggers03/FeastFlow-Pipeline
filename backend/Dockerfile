# ── Stage 1: Dependencies ─────────────────────────────────────
FROM node:18-alpine AS deps
LABEL stage="deps"

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: Test (run in CI, not shipped) ───────────────────
FROM node:18-alpine AS test
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test

# ── Stage 3: Production Image ────────────────────────────────
FROM node:18-alpine AS production

ARG BUILD_DATE
ARG VCS_REF
LABEL org.label-schema.build-date="${BUILD_DATE}" \
      org.label-schema.vcs-ref="${VCS_REF}"       \
      org.label-schema.name="feastflow-backend"   \
      org.label-schema.version="1.0.0"

# Non-root user for security
RUN addgroup -S feastflow && adduser -S feastflow -G feastflow

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=feastflow:feastflow . .

USER feastflow

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "src/server.js"]
