# TikTok Integration

The **Behind the Scenes** page pulls @hghvpodcast's latest TikTok videos from
`GET /api/tiktok/latest`. The route can source videos in three ways:

1. **Direct TikTok Display API** — self-hosted, no Lovable dependency (most setup).
2. **Lovable connector gateway** — reuse the Lovable-managed TikTok connection on
   any server, including a self-hosted Docker box, by copying two secrets.
3. **Hardcoded fallback clips** — shown when nothing is configured.

If any step isn't completed, the page gracefully falls back to a hardcoded set
of clips — nothing breaks.

---

## 1. Create a TikTok for Developers app

1. Go to <https://developers.tiktok.com/> and log in (use the @hghvpodcast
   account or an account that manages it).
2. Create an app under **Manage apps → Connect an app**.
3. Add the **Login Kit** and **Display API** products.
4. Request the scopes: `user.info.basic` and `video.list`.
5. Under **Login Kit → Redirect URI**, register:

   ```
   https://YOUR-DOMAIN/api/tiktok/auth/callback
   ```

   Use your real production domain. (For local testing you can also add
   `http://localhost:3000/api/tiktok/auth/callback`.) The redirect URI must
   match **exactly**.
6. Copy the app's **Client key** and **Client secret**.

> Note: video.list returns real data only once your app is approved/live. In
> sandbox mode it returns data only for added test users.

## 2. Set environment variables

Add these to your server env (e.g. `.env` for Docker Compose):

```bash
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_ADMIN_TOKEN=any_long_random_string   # gates the one-time connect flow
# TIKTOK_REFRESH_TOKEN is filled in after step 3
```

Restart the app so it picks up the variables.

## 3. Authorize the account (one-time)

1. In your browser, open:

   ```
   https://YOUR-DOMAIN/api/tiktok/auth/start?key=YOUR_TIKTOK_ADMIN_TOKEN
   ```

2. Log in / confirm as @hghvpodcast and approve the requested permissions.
3. TikTok redirects back and the page displays a **refresh token**.
4. Copy it and set it as an env var, then restart the container:

   ```bash
   TIKTOK_REFRESH_TOKEN=the_token_shown
   ```

That's it. The server now exchanges the refresh token for short-lived access
tokens automatically (cached in memory) and `/api/tiktok/latest` returns the 6
newest videos, refreshed hourly.

---

## How it works

- `/api/tiktok/latest` selects a source in this order:
  1. **Direct API** when `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, and
     `TIKTOK_REFRESH_TOKEN` are all set.
  2. **Lovable connector gateway** when running on Lovable
     (`LOVABLE_API_KEY` + `TIKTOK_API_KEY`).
  3. **Empty list** → the page shows its hardcoded fallback clips.
- Access tokens are cached in memory and refreshed ~1 minute before expiry.
  This cache resets on restart (harmless — it just refreshes again).

## Troubleshooting

- **403 at `/api/tiktok/auth/start`** — `key` doesn't match
  `TIKTOK_ADMIN_TOKEN`, or that var isn't set.
- **`redirect_uri` mismatch from TikTok** — the URI registered in the TikTok
  app must exactly equal `https://YOUR-DOMAIN/api/tiktok/auth/callback`.
- **Feed empty but clips still show** — token refresh or `video.list` failed;
  check server logs. The app degrades gracefully to the fallback clips.
- **Token rotated** — if TikTok issues a new refresh token, it's used for the
  process lifetime; re-run step 3 and update `TIKTOK_REFRESH_TOKEN` if the feed
  stops after a long period.
