# =============================================================================
# gstnoticesupport.in — Server (Express + TypeScript) production image
# Multi-stage: build with full toolchain, run on a slim glibc runtime.
# Database is external (NeonDB) — no DB service in this image.
# Migrations are NOT run here — apply `prisma migrate deploy` out of band.
# =============================================================================

# ── Stage 1: builder ─────────────────────────────────────────────────────────
# Compiles TypeScript and generates the Prisma client. Needs the native
# toolchain (python3/make/g++) because `bcrypt` builds a native addon, and
# `openssl` because Prisma's query engine links against it.
FROM node:20-slim AS builder

# Prisma engine + bcrypt build prerequisites.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies against the lockfile first, for layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Prisma client must be generated before the app is compiled/run.
COPY prisma ./prisma
RUN npx prisma generate

# Compile TypeScript (tsc → dist/).
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop devDependencies, then regenerate the Prisma client so the engine and
# generated client match the pruned production tree exactly.
RUN npm prune --omit=dev \
    && npx prisma generate

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
# Only the compiled app, production node_modules, and the Prisma runtime.
FROM node:20-slim AS runtime

# openssl for the Prisma query engine; ca-certificates for TLS to Neon
# (DATABASE_URL uses sslmode=require) and the AWS/Razorpay/Resend APIs.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

# Copy production artifacts from the builder. --chown hands them to the
# unprivileged `node` user that the base image already ships with.
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/package.json ./package.json

# Never run as root.
USER node

EXPOSE 4000

# App validates all env vars at boot (src/lib/env.ts) and exits if any are
# missing — inject them at runtime (`--env-file` / -e / orchestrator secrets),
# never bake them into the image.
CMD ["node", "dist/index.js"]
