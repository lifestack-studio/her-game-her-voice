# syntax=docker/dockerfile:1

###############################################################################
# Her Game, Her Voice — TanStack Start (SSR) production image
#
# Built and published as a public container image (GHCR) by CI; the VPS pulls
# the image rather than building locally. The app is compiled with Nitro's
# "node-server" preset (via NITRO_PRESET, which vite.config.ts forwards to
# Nitro) into a fully self-contained bundle at dist/server/index.mjs that runs
# on Bun and needs no node_modules at runtime.
###############################################################################

FROM oven/bun:1.1.38-slim AS base
WORKDIR /app

# ---- Dependencies (cached layer) ------------------------------------------
FROM base AS deps
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# ---- Build -----------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# REQUIRED: TanStack Start + Nitro only emit a standalone server when a preset
# is set. Without this, no dist/server/index.mjs is produced and there is
# nothing to run. node-server binds PORT/HOST and serves SSR + API routes.
ENV NITRO_PRESET=node-server
RUN bun run build

# ---- Runtime ---------------------------------------------------------------
FROM oven/bun:1.1.38-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# The Nitro output is self-contained: only the dist/ bundle plus package.json
# (for the `start` script) are needed — no node_modules at runtime.
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

# Drop privileges — the oven/bun image ships a non-root `bun` user.
USER bun

EXPOSE 3000

# Health: the runtime is Bun, which provides global fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# `start` => bun ./dist/server/index.mjs (see package.json)
CMD ["bun", "run", "start"]
