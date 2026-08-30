# Deploying Her Game, Her Voice

The site runs as a Docker container on a Hostinger VPS, behind **Traefik**,
which terminates TLS and routes by hostname. The image is built by GitHub
Actions and published to GHCR; the VPS only ever **pulls**.

> Nothing is built on the VPS. It is a shared box running many unrelated
> containers, and a Vite build there would compete with all of them for RAM.

## Topology

| | |
|---|---|
| Host | `168.231.115.10` (`srv838476`, Ubuntu 24.04, x86_64) |
| Compose project | `/docker/her-game-her-voice/docker-compose.yml` |
| Service / container | `web` / `her-game-her-voice-web-1` |
| Image | `ghcr.io/lifestack-studio/her-game-her-voice:latest` |
| Reverse proxy | Traefik on the external network `root_traefik-net` |
| TLS | Traefik certresolver `mytlschallenge` (no certbot, no nginx) |
| App port | `3000`, internal only — no host port is published |

Routing and TLS are declared as **labels in the compose file**, not in any
Traefik config file. Both `hergamehervoice.co.uk` and `www.` are matched, and
plain HTTP is redirected to HTTPS by the `hergamehervoice-https` middleware.

## Normal deploy

Push to `main`. GitHub Actions (`.github/workflows/docker-publish.yml`) builds
the image and pushes `:latest` to GHCR. Then, on the VPS:

```bash
ssh root@168.231.115.10
cd /docker/her-game-her-voice
docker compose pull && docker compose up -d
```

Or as a one-liner from your machine:

```bash
ssh root@168.231.115.10 'cd /docker/her-game-her-voice && docker compose pull && docker compose up -d'
```

Expect a few seconds during which Traefik returns 502 while the container swaps.

### Always leave yourself a rollback

Before pulling, tag whatever is currently running:

```bash
ssh root@168.231.115.10 '
  docker tag ghcr.io/lifestack-studio/her-game-her-voice:latest \
             ghcr.io/lifestack-studio/her-game-her-voice:rollback-$(date +%Y%m%d)'
```

To roll back, retag and recreate:

```bash
ssh root@168.231.115.10 '
  docker tag ghcr.io/lifestack-studio/her-game-her-voice:rollback-YYYYMMDD \
             ghcr.io/lifestack-studio/her-game-her-voice:latest
  cd /docker/her-game-her-voice && docker compose up -d'
```

## Deploying without GitHub

To ship a local build straight to the VPS — useful when testing a fix before
committing. **Build for `linux/amd64`**: the VPS is x86_64, and
`package-lock.json` only carries `linux-x64` variants of the native
`lightningcss` and `@tailwindcss/oxide` binaries, so an arm64 build fails.

```bash
docker build --platform linux/amd64 --provenance=false --sbom=false \
  -t hghv-site:deploy .

docker save hghv-site:deploy | gzip -1 \
  | ssh root@168.231.115.10 'gunzip | docker load'

ssh root@168.231.115.10 '
  docker tag hghv-site:deploy ghcr.io/lifestack-studio/her-game-her-voice:latest
  cd /docker/her-game-her-voice && docker compose up -d'
```

Note this leaves GHCR and the VPS out of sync until the next `main` build. Run
`docker compose pull && docker compose up -d` afterwards to resync.

## Configuration

Environment variables are set **inline in the compose file**, under
`services.web.environment`. The adjacent `.env` is empty and unused.

Currently set:

```yaml
NODE_ENV: production
PORT: "3000"
HOST: "0.0.0.0"
PODCAST_RSS_URL: "https://anchor.fm/s/106fb9ee0/podcast/rss"
```

Optional additions, all read at **runtime** — adding one needs only
`docker compose up -d`, never a rebuild:

| Variable | Enables | Without it |
|---|---|---|
| `STRIPE_SECRET_KEY` | Jersey checkout | `/shop` renders; checkout throws a clear "Stripe is not configured" error |
| `STRIPE_WEBHOOK_SECRET` | Verified Stripe webhooks at `/api/public/stripe/webhook` | Webhook events are not verified |
| `TIKTOK_*` / `LOVABLE_API_KEY` | Live TikTok feed on `/behind-the-scenes` | Falls back to hardcoded clips |

See `.env.example` for the full list and `TIKTOK_SETUP.md` for the TikTok flows.

## Images must be real files, never Lovable stubs

Images added through the Lovable editor are exported as
`src/assets/<name>.<ext>.asset.json` pointer stubs whose `url` resolves to
`/__l5e/assets-v1/...` — a path **only Lovable's own hosting serves**. Self
hosted, every one of them 404s.

After any Lovable re-export, check:

```bash
grep -rn 'asset\.json' src/
```

Any hit must be resolved before deploying: download the real binary from
`https://<project_id>.lovableproject.com<url>` (both fields are inside the
stub; verify the bytes match its `size`), save it under the stub's base
filename, delete the stub, and change the import to drop both the
`.asset.json` suffix and the `.url` property access. `src/components/site-header.tsx`
shows the correct direct-import pattern.

`.dockerignore` contains `**/*.asset.json`, so a stub that survives into a
build will fail it loudly rather than silently shipping a 404.

## Build notes

- The Dockerfile builds with `NITRO_PRESET=node-server`, which emits a
  standalone server to **`.output/`** — not `dist/`. The comment in
  `vite.config.ts` claiming `dist/server/index.mjs` is stale.
- The runner stage must copy the **whole** `.output` tree; Nitro externalises
  some dependencies into `.output/server/node_modules`.
- Nitro 3 reads `PORT`/`HOST`; `NITRO_PORT`/`NITRO_HOST` are set too for
  compatibility.

## Health checks

```bash
# container state
ssh root@168.231.115.10 'docker ps --filter name=her-game-her-voice-web-1'

# logs
ssh root@168.231.115.10 'docker logs -f her-game-her-voice-web-1'

# from outside
curl -sS -o /dev/null -w '%{http_code}\n' https://hergamehervoice.co.uk/
```

A good post-deploy check is that no Lovable CDN references survived:

```bash
curl -sS https://hergamehervoice.co.uk/ | grep -c '__l5e'   # expect 0
```
