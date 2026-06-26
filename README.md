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
| `bun dev`          | Start the Vite dev server                            |
| `bun build`        | Production build (Cloudflare target by default; set `NITRO_PRESET=node-server` to emit the standalone `dist/server/index.mjs` used by Docker) |
| `bun run build:dev`| Build in development mode                             |
| `bun preview`      | Preview the production build locally                  |
| `bun start`        | Run the built standalone server (`dist/server/index.mjs`) — used by the container |
| `bun lint`         | Run ESLint                                            |
| `bun format`       | Format all files with Prettier                       |

## Environment variables

Server-only secrets are read from the environment and never exposed to the browser.

| Variable                        | Required | Description                                                                 |
| ------------------------------- | -------- | --------------------------------------------------------------------------- |
| `PODCAST_RSS_URL`               | Yes      | The show's RSS feed URL. Powers `/api/podcast/latest`, which returns the 3 most recent episodes. Without it the endpoint responds `503`. |
| `VITE_STRIPE_PUBLISHABLE_KEY`   | Yes*     | Stripe public key (shown in the browser, safe to expose).                   |
| `STRIPE_SECRET_KEY`             | Yes*     | Stripe secret key (server-only). Used to create Checkout sessions.           |
| `STRIPE_WEBHOOK_SECRET`         | No       | Optional. Enables `/api/public/stripe/webhook` to receive payment events.    |
| `VITE_FORMSPREE_ENDPOINT`       | No       | Optional. Used to email order details after payment.                          |

\* Required for jersey orders only. The site still works without Stripe if the shop feature is not used.

For local development, place variables in a `.dev.vars` file (gitignored). For
Docker/production, use a `.env` file (see [Deployment](#deployment-docker--hostinger-vps)).

## Deployment (Docker / Hostinger VPS)

Deployment uses a **prebuilt public image** — the VPS pulls it, it does **not**
build locally. CI publishes the image to GitHub Container Registry (GHCR) on every
push to `main`; Hostinger Docker Manager then runs `docker compose up -d` to pull
and start it. It's a stateless SSR site: **no database, Redis, or other supporting
services are required**; the only external dependency is the podcast RSS feed
(`PODCAST_RSS_URL`).

The image compiles the app with Nitro's **`node-server`** preset (driven by the
`NITRO_PRESET` env var, which `vite.config.ts` forwards to Nitro) into a
self-contained `dist/server/index.mjs` that Bun runs as a standalone server —
completely independent of Lovable's internal Cloudflare publishing, which is left
untouched.

**Files involved:**

- `.github/workflows/docker-publish.yml` — builds & pushes the image to GHCR on push to `main`
- `Dockerfile` — multi-stage Bun build → self-contained runtime (`bun run start`)
- `docker-compose.yml` — `image:`-only (no local build); project `her-game-her-voice`, service `web`, port `3000`
- `.dockerignore` — keeps the build context/image small
- `.env.example` — copy to `.env` and fill in

Published image: **`ghcr.io/lifestack-studio/her-game-her-voice:latest`**

### One-time setup: make the GHCR package public

GHCR packages are created **private** by default, and the `GITHUB_TOKEN` used by
CI **cannot** flip visibility — this must be done once by hand. So Docker Manager
can pull without credentials, make it public after the first successful CI run:

1. Push to `main` and wait for the **"Build and publish image"** Actions run to
   finish (the package doesn't exist in GitHub until then — if you don't see it
   yet, the run hasn't completed).
2. GitHub → the **`her-game-her-voice`** repo → **Packages** (right sidebar) →
   open the `her-game-her-voice` package.
3. **Package settings** → **Danger Zone** → **Change visibility** → **Public**.
   (If your org restricts this, an org admin must do it.)

(One time only — subsequent pushes just update the public image.)

### Deploy on the VPS / Hostinger Docker Manager

> **Prerequisite:** complete "make the GHCR package public" above first. Otherwise
> the pull fails with `denied` / `manifest unknown` / `not found`, because the VPS
> pulls anonymously.

In Hostinger's **Docker Manager**, create a project named **`her-game-her-voice`**
using this repo's root `docker-compose.yml`, and set `PODCAST_RSS_URL` as a project
environment variable. Or from a shell on the VPS:

```bash
git clone https://github.com/lifestack-studio/her-game-her-voice.git
cd her-game-her-voice
cp .env.example .env          # then set PODCAST_RSS_URL=https://your-feed-url/rss
docker compose up -d          # pulls the public image and starts it
```

The site is then live at `http://<your-vps-ip>:3000`. The server binds
`0.0.0.0:3000`, so it's reachable from outside the container.

### Common operations

```bash
docker compose pull && docker compose up -d   # update to the latest published image
docker compose logs -f                        # tail logs
docker compose down                           # stop and remove the container
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
