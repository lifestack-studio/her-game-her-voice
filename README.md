# Her Game, Her Voice

The website for **Her Game, Her Voice** — a podcast celebrating the women changing the face of ice hockey across the UK and Europe. Hosted by Emma Stigter, each episode features honest, in-person conversations with players, captains, and changemakers.

🎧 [Listen on Spotify](https://open.spotify.com/show/3H4XRlV2oIFAS9u9Z5vvme)

## Tech stack

- **[TanStack Start](https://tanstack.com/start)** — full-stack React framework (file-based routing + SSR)
- **[React 19](https://react.dev/)**
- **[Vite 7](https://vite.dev/)** — build tooling
- **[Nitro](https://nitro.build/)** — server runtime (Cloudflare as default build target)
- **[Tailwind CSS v4](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** (New York style, Radix primitives)
- **[TanStack Query](https://tanstack.com/query)** — data fetching/caching
- **[react-hook-form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — forms & validation
- **TypeScript**, **ESLint**, **Prettier**
- Built and edited with **[Lovable](https://lovable.dev/)**

## Getting started

This project uses [Bun](https://bun.sh/) as its package manager.

```bash
# Install dependencies
bun install

# Start the dev server
bun dev
```

The dev server runs at the URL printed in your terminal (typically http://localhost:3000).

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `bun dev`          | Start the Vite dev server                    |
| `bun build`        | Production build                             |
| `bun run build:dev`| Build in development mode                    |
| `bun preview`      | Preview the production build locally         |
| `bun lint`         | Run ESLint                                   |
| `bun format`       | Format all files with Prettier               |

## Environment variables

Server-only secrets are read from the environment and never exposed to the browser.

| Variable          | Required | Description                                                                 |
| ----------------- | -------- | --------------------------------------------------------------------------- |
| `PODCAST_RSS_URL` | Yes      | The show's RSS feed URL. Powers `/api/podcast/latest`, which returns the 3 most recent episodes. Without it the endpoint responds `503`. |

For local development, place variables in a `.dev.vars` file (gitignored). For
Docker/production, use a `.env` file (see [Deployment](#deployment-docker--hostinger-vps)).

## Deployment (Docker / Hostinger VPS)

The app ships as a self-contained Docker image and runs with **one command** — no
manual build or setup steps. It's a stateless SSR site: **no database, Redis, or
other supporting services are required**; the only external dependency is the
podcast RSS feed (`PODCAST_RSS_URL`).

The image builds the app with Nitro's **`node-server`** preset (driven by the
`NITRO_PRESET` env var, which `vite.config.ts` forwards to Nitro) so it runs as a
plain Node server on a VPS — completely independent of Lovable's internal
Cloudflare publishing, which is left untouched.

**Files involved:**

- `Dockerfile` — multi-stage build (Bun builds → `node:22-slim` runs `dist/server/index.mjs`)
- `.dockerignore` — keeps the build context/image small
- `docker-compose.yml` — one-command run; project name `her-game-her-voice`, service `web`, exposes port `3000`
- `.env.example` — copy to `.env` and fill in

### Quick start

```bash
# 1. Get the code onto the VPS
git clone https://github.com/lifestack-studio/her-game-her-voice.git
cd her-game-her-voice

# 2. Set secrets (optional but recommended)
cp .env.example .env
# then edit .env and set PODCAST_RSS_URL=https://your-feed-url/rss

# 3. Build & start (image builds automatically on first run)
docker compose up -d
```

The site is then live on the VPS at `http://<your-vps-ip>:3000`. The server binds
`0.0.0.0:3000`, so it's reachable from outside the container.

### Hostinger Docker Manager

In Hostinger's **Docker Manager**, create a project named **`her-game-her-voice`**
pointing at this repository. It uses the root `docker-compose.yml` and runs
`docker compose up -d` for you — set `PODCAST_RSS_URL` as a project environment
variable (or commit a `.env` to the server, never to git).

### Common operations

```bash
docker compose logs -f          # tail logs
docker compose up -d --build    # rebuild & restart after pulling new code
docker compose down             # stop and remove the container
```

> Change the host-side port in `docker-compose.yml` (e.g. `"8080:3000"`) if 3000
> is already in use. To serve a domain over HTTPS, put a reverse proxy (Hostinger's
> Nginx Proxy Manager, Caddy, etc.) in front of `http://127.0.0.1:3000`.

## Project structure

```
src/
├── routes/              # File-based routes (TanStack Start)
│   ├── __root.tsx       # App shell — head/meta, header, footer, error & 404 boundaries
│   ├── index.tsx        # Home page
│   ├── about.tsx        # About / host story
│   ├── episodes.tsx     # Episodes
│   ├── bloopers.tsx     # Bloopers
│   ├── shop.tsx         # Merch shop
│   ├── contact.tsx      # Contact / guest & sponsor enquiries
│   ├── sitemap[.]xml.ts # Generated sitemap
│   └── api/podcast/
│       └── latest.ts    # GET /api/podcast/latest — parses the RSS feed server-side
├── components/          # Site components (audio-player, episode-card, site-header, …)
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Shared React hooks
├── lib/                 # Utilities (cn helper, Lovable error reporting)
├── assets/              # Images & static media
├── styles.css           # Tailwind entry + theme tokens
├── router.tsx           # Router setup
└── server.ts            # SSR server entry (error wrapper)
```

> **Routing note:** Routes are file-based. `routeTree.gen.ts` is auto-generated — don't edit it by hand. See `src/routes/README.md` for routing conventions.

## Notes

- `vite.config.ts` uses `@lovable.dev/vite-tanstack-config`, which bundles the TanStack Start, React, Tailwind, Nitro, and path-alias plugins. Don't add those plugins manually or the build will break with duplicates.
- `bunfig.toml` enforces a 24-hour supply-chain guard (`minimumReleaseAge`) on installs.
