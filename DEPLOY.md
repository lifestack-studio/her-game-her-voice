# Self-hosting Her Game, Her Voice on Hostinger VPS (Docker)

This guide packages the TanStack Start site as a Docker container using the **Nitro `node-server` preset**, which produces a standalone Node.js server.

## 1. Get the source code

### Option A — GitHub (recommended)
1. In the Lovable editor, click **Plus (+) → GitHub** and connect your repository.
2. Clone it locally or directly onto your VPS:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

### Option B — Download ZIP
1. In the Lovable editor, open the **Project menu → Download as ZIP**.
2. Upload and unzip the archive on your VPS:
   ```bash
   unzip hghv-site.zip -d hghv-site
   cd hghv-site
   ```

## 2. Required environment variables

Create a `.env` file in the project root. The site will not start if required secrets are missing.

```bash
# Stripe (required for jersey checkout)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# TikTok connector (optional — only if you use the dynamic TikTok feed)
# TIKTOK_ACCESS_TOKEN=...
# TIKTOK_OPEN_ID=...
```

> **Security:** keep `.env` out of Git. It is already ignored by `.dockerignore` and `.gitignore`.

## 3. Build and run locally (test first)

```bash
# Build the image
docker build -t hghv-site .

# Run it
docker run -p 3000:3000 --env-file .env hghv-site
```

Open `http://localhost:3000`. You should see the site.

## 4. Deploy on Hostinger VPS

### A. Prepare the VPS
1. Log in to your Hostinger VPS.
2. Install Docker and Docker Compose:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose-plugin
   sudo systemctl enable --now docker
   ```

### B. Upload the project
Use `scp`, `rsync`, or Hostinger’s file manager to upload the project folder to `/opt/hghv-site`.

```bash
rsync -avz --exclude=node_modules --exclude=dist --exclude=.git ./ root@YOUR_VPS_IP:/opt/hghv-site/
```

### C. Create the environment file on the server
SSH into the VPS and create `/opt/hghv-site/.env` with the same variables from step 2.

```bash
ssh root@YOUR_VPS_IP
nano /opt/hghv-site/.env
```

### D. Start the container
```bash
cd /opt/hghv-site
docker compose up -d --build
```

The site will be available on the VPS at `http://YOUR_VPS_IP:3000`.

### E. Reverse proxy with Nginx (so it serves on port 443/80)
Create `/etc/nginx/sites-available/hghv`:

```nginx
server {
    listen 80;
    server_name hergamehervoice.co.uk www.hergamehervoice.co.uk;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:
```bash
ln -s /etc/nginx/sites-available/hghv /etc/nginx/sites-enabled/hghv
nginx -t
systemctl restart nginx
```

### F. HTTPS with Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hergamehervoice.co.uk -d www.hergamehervoice.co.uk
```

## 5. Updating the site

When you make changes in Lovable:

1. Pull the latest code (if using GitHub):
   ```bash
   cd /opt/hghv-site
   git pull
   ```
2. Rebuild and restart the container:
   ```bash
   docker compose up -d --build
   ```

## 6. Useful commands

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Free space by removing old images
docker system prune -f
```

## 7. Notes

- The Docker build uses `NITRO_PRESET=node-server` so the output is a standalone Node server at `dist/server/index.mjs`.
- The image exposes port `3000`. Nginx handles ports 80/443.
- Webhook endpoints (e.g., Stripe) are served under `/api/public/stripe/webhook`, which works without extra routing rules.
