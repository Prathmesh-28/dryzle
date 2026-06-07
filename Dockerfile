# syntax=docker/dockerfile:1
# v3 — runner copies node_modules from builder; no pnpm install in runner

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma

RUN pnpm install --frozen-lockfile

COPY shared/ ./shared/
COPY backend/ ./backend/

RUN cd backend && pnpm prisma generate && pnpm build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

# Copy compiled backend + all node_modules from builder (no reinstall needed)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared ./shared
COPY tsconfig.json ./
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json backend/tsconfig.json ./backend/
COPY backend/prisma ./backend/prisma

EXPOSE 3001

CMD ["sh", "-c", "cd /app/backend && ./node_modules/.bin/prisma migrate deploy && ./node_modules/.bin/ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts && node dist/main"]
