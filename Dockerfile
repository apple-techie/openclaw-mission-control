# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache sqlite git

COPY package.json package-lock.json ./
RUN npm ci --include=optional --no-audit --no-fund

COPY . .

ARG APP_VERSION=""
ARG COMMIT_HASH=""
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}
ENV NEXT_PUBLIC_COMMIT_HASH=${COMMIT_HASH}

RUN npm run build
RUN npm prune --omit=dev

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/bin ./bin
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./

USER appuser

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3333/api/status || exit 1

CMD ["node", "node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3333"]
