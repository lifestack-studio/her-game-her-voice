# Self-Hosting on a Hostinger VPS with Docker

This app is a TanStack Start (SSR) site. The Docker image builds it with the
Nitro **`node-server`** preset so it runs as a normal Node server — independent
of Lovable's internal Cloudflare publishing (which is left untouched, so the
Lovable preview/publish still works as before).

## What's included

- `Dockerfile` — multi-stage build (Bun builds, Node 22 runs `dist/server/index.mjs`)
- `.dockerignore` — keeps the image small
- `docker-compose.yml` — one-command run, exposes port `3000`

## 1. Get the code onto the VPS

SSH into your Hostinger VPS, then clone your GitHub repo (or `git pull` if it
already exists):

```bash
git clone <your-github-repo-url> hghv
cd hghv
```

## 2. (Optional) set secrets

The podcast feed URL is needed for `/api/podcast/latest` to return episodes.
Create a `.env` file next to `docker-compose.yml` — it is read automatically by
Compose:

```bash
cat > .env <<'EOF'
PODCAST_RSS_URL=https://your-feed-url/rss
EOF
```

## 3. Build & run

```bash
docker compose up -d --build
```

The site is now live on the VPS at `http://<your-vps-ip>:3000`.

To update after pushing new code to GitHub:

```bash
git pull
docker compose up -d --build
```

Logs / stop:

```bash
docker compose logs -f
docker compose down
```

## 4. Put it behind a domain (HTTPS)

Run a reverse proxy in front of the container so visitors hit ports 80/443 with
a real certificate. Easiest option is Caddy (automatic Let's Encrypt):

```bash
# /etc/caddy/Caddyfile
yourdomain.com {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
docker run -d --name caddy --network host \
  -v /etc/caddy/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data caddy:2
```

Point your domain's DNS A record at the VPS IP and Caddy handles TLS
automatically. (Nginx Proxy Manager, available in Hostinger's panel, works too —
just proxy your domain to `http://127.0.0.1:3000`.)

## Notes

- The container listens on `PORT` (default `3000`) and `HOST=0.0.0.0`. Change the
  host-side port in `docker-compose.yml` (`"8080:3000"`) if 3000 is taken.
- The build always uses `NITRO_PRESET=node-server` (set inside the Dockerfile) —
  do not change `vite.config.ts`; Lovable relies on its Cloudflare default.
