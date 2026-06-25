## Answer first
Connecting TikTok via the Lovable integration does **not** auto-provision your self-hosted server. Lovable has no way to write secrets into a remote Docker host. What it *can* do: the Lovable connector is backed by a **public HTTPS gateway** (`connector-gateway.lovable.dev`) that holds and auto-refreshes the TikTok OAuth tokens for you. Your self-hosted app can call that gateway from anywhere as long as it has two secrets — so "connect once on Lovable, reuse on self-host" works with a single manual copy step, not full automation.

The hybrid `/api/tiktok/latest` route already built last turn supports this: if `LOVABLE_API_KEY` + `TIKTOK_API_KEY` are present (and the direct-API vars are not), it uses the gateway path automatically.

## Two paths compared
- **Path A — Reuse the Lovable connection (this plan):** Connect TikTok on Lovable, then copy `LOVABLE_API_KEY` and `TIKTOK_API_KEY` into your Docker env. No TikTok app, no OAuth flow. Lovable refreshes tokens. Trade-off: your self-hosted site keeps a **runtime dependency on Lovable's gateway**, and breaks if `LOVABLE_API_KEY` is rotated (you'd re-copy it).
- **Path B — Direct TikTok Display API (already built, fully independent):** Your own TikTok app + the built-in OAuth flow + `TIKTOK_REFRESH_TOKEN`. No Lovable dependency. More setup. (Documented in `TIKTOK_SETUP.md`.)

This plan implements **Path A** and documents both so you can pick per environment. They coexist — the route already prioritizes direct config over the gateway.

## Steps
1. **Link the TikTok connector on Lovable.** Run the connect flow so `TIKTOK_API_KEY` is injected into project secrets (`LOVABLE_API_KEY` already exists). This requires authorizing the @hghvpodcast account in the Lovable prompt.
2. **Verify the gateway returns videos.** Call `video/list` through the gateway from the build sandbox to confirm the connection is live and the account is authorized, so we know the path works before relying on it.
3. **Document "reuse from self-host" (Path A).** Update `TIKTOK_SETUP.md` (and `.env.example`) with a clear section:
   - Copy `LOVABLE_API_KEY` and `TIKTOK_API_KEY` values from Lovable project secrets into the Docker `.env`.
   - Leave `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` / `TIKTOK_REFRESH_TOKEN` unset (their presence would override and switch to direct API).
   - Note the rotation caveat: if `LOVABLE_API_KEY` is rotated on Lovable, update the Docker env and restart.
4. **No code changes to the route.** The existing hybrid selection (direct → gateway → empty) already handles Path A correctly. I'll just re-confirm the precedence comment is accurate.

## What stays manual (cannot be automated)
- Copying the two secret values to your Docker host (Lovable can't write to your server).
- Re-copying `LOVABLE_API_KEY` if you ever rotate it.

## Files
- `TIKTOK_SETUP.md` — add a "Path A: reuse the Lovable connection on self-host" section.
- `.env.example` — clarify that setting only `LOVABLE_API_KEY` + `TIKTOK_API_KEY` uses the gateway path.
- (Possibly) a short note in `DEPLOY.md`/README if a deploy guide references TikTok.

## Recommendation
If you want the self-hosted site to be genuinely independent of Lovable, prefer **Path B** (already built). Choose **Path A** only if you're fine with the self-hosted site depending on Lovable's gateway at runtime in exchange for zero TikTok-app setup.