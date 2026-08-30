# Multi-stage Dockerfile for Her Game, Her Voice (TanStack Start + Nitro node-server)
# Build: docker build -t hghv-site .
# Run:  docker run -p 3000:3000 --env-file .env hghv-site

# ------------------------------------------------------------------
# Stage 1: dependencies
# ------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install build tools needed for some native deps (if any)
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* bun.lockb* ./

# Install with the lockfile available in your repo (npm/pnpm/yarn/bun)
# Fallback to npm install if no lockfile is present.
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then npm install -g yarn && yarn install --frozen-lockfile; \
    elif [ -f bun.lockb ]; then npm install -g bun && bun install; \
    else npm install; fi

# ------------------------------------------------------------------
# Stage 2: build the app with Nitro node-server preset
# ------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Bring installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Force Nitro to emit a standalone Node server instead of the Cloudflare preset.
ENV NITRO_PRESET=node-server
ENV NODE_ENV=production

RUN npm run build

# ------------------------------------------------------------------
# Stage 3: production runtime
# ------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV HOST=0.0.0.0

# Copy only the standalone server output and required static assets
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Runtime secrets are injected via --env-file or -e at run time.
# Do NOT commit real secrets into this image.

EXPOSE 3000

CMD ["node", "./.output/server/index.mjs"]
