# syntax=docker/dockerfile:1

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Workspace manifests + lockfile first (cache layer)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

# Source
COPY shared/ ./shared/
COPY backend/ ./backend/

RUN cd backend && pnpm prisma generate && pnpm build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy build artifacts + generated Prisma client from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules/.pnpm /app/node_modules/.pnpm

EXPOSE 3001

CMD ["sh", "-c", "cd /app/backend && npx prisma migrate deploy && node /app/backend/dist/main"]
