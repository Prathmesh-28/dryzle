# syntax=docker/dockerfile:1

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Workspace manifests first (cache layer)
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY tsconfig.json ./
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

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-workspace.yaml ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy build artefacts
COPY --from=builder /app/backend/dist            ./backend/dist
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY backend/prisma ./backend/prisma

EXPOSE 3001

# Run migrations then start
CMD ["sh", "-c", "cd /app/backend && npx prisma migrate deploy && node /app/backend/dist/main"]
