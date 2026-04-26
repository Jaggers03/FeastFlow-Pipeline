# ── Stage 1: Build ───────────────────────────────────────
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# ── Stage 2: Production with Nginx ───────────────────────────
FROM nginx:1.25-alpine AS production

ARG BUILD_DATE
ARG VCS_REF
LABEL org.label-schema.build-date="${BUILD_DATE}" \
      org.label-schema.vcs-ref="${VCS_REF}"       \
      org.label-schema.name="feastflow-frontend"   \
      org.label-schema.version="1.0.0"

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app (Angular 17+ outputs to dist/frontend/browser)
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
