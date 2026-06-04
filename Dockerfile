# syntax=docker/dockerfile:1

###############################################################################
# Her Game, Her Voice — TanStack Start (SSR) production image
#
# The app is built with Nitro's "node-server" preset (set via NITRO_PRESET,
# which vite.config.ts forwards to Nitro) so it runs as a plain Node server,
# independent of Lovable's internal Cloudflare publishing. The build emits a
# fully self-contained bundle at dist/server/index.mjs that needs only Node at
# runtime — no node_modules install in the final image.
###############################################################################

# ---- 1. Build stage -------------------------------------------------------
FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Copy the rest of the source and build for a standalone Node target.
COPY . .
ENV NITRO_PRESET=node-server
RUN bun run build

# ---- 2. Runtime stage -----------------------------------------------------
# Small Node image — the built output is self-contained ESM.
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Nitro's node-server listens on PORT (default 3000) and binds HOST 0.0.0.0.
ENV PORT=3000
ENV HOST=0.0.0.0

# Run as the non-root user that the base image already ships.
USER node

# Only the built artifacts are needed at runtime.
COPY --from=build --chown=node:node /app/dist ./dist

EXPOSE 3000

# Container healthcheck against the running server (node 22 has global fetch).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/index.mjs"]
