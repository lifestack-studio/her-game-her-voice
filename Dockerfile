# syntax=docker/dockerfile:1

###############################################################################
# Her Game, Her Voice — TanStack Start (SSR) Docker image for self-hosting
# Builds with the Nitro "node-server" preset so the app runs on a plain Node
# server (instead of the Cloudflare Workers preset Lovable uses internally).
###############################################################################

# ---- 1. Build stage -------------------------------------------------------
FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Copy the rest of the source and build for a Node target
COPY . .
ENV NITRO_PRESET=node-server
RUN bun run build

# ---- 2. Runtime stage -----------------------------------------------------
# Small Node image — the built output is plain ESM and only needs Node.
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Nitro's node-server listens on PORT (default 3000) and HOST 0.0.0.0
ENV PORT=3000
ENV HOST=0.0.0.0

# Only the built artifacts are needed at runtime
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Basic container healthcheck against the running server
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/index.mjs"]
