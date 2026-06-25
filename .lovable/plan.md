## Goal
Make the Behind the Scenes TikTok feed fetch @hghvpodcast's latest videos automatically on a **self-hosted Docker deployment**, where Lovable's connector gateway (`connector-gateway.lovable.dev`, `LOVABLE_API_KEY`, `TIKTOK_API_KEY`) does not exist. We'll add a direct **TikTok Display API** path with a built-in one-time OAuth authorization flow (like the Lovable connect step), keep the Lovable gateway path as a fallback (hybrid), and store tokens via env vars with in-memory access-token refresh.

## What's unavoidable
TikTok's Display API requires a registered **TikTok for Developers app** (Client Key + Client Secret) with the `user.info.basic` + `video.list` scopes and a registered redirect URI. There is no public "latest videos" endpoint without this. The built-in flow removes the manual curl/token juggling — you log into the TikTok account once and the site captures the refresh token — but the app credentials still have to be created once in the TikTok developer portal (guidance included in the deliverable).

## Approach

### 1. Built-in OAuth authorization flow (one-time, like Lovable's connect)
Add two server routes so you authorize by clicking, not by hand:

- `GET /api/tiktok/auth/start` — redirects to TikTok's `authorize` URL with the configured Client Key, scopes (`user.info.basic,video.list`), redirect URI, and a signed CSRF `state`.
- `GET /api/tiktok/auth/callback` — exchanges the returned `code` for `access_token` + `refresh_token`, then renders a minimal page showing the **refresh token** to copy.

Both routes are gated by an admin secret (`TIKTOK_ADMIN_TOKEN`, passed as a `?key=` query param) so a published/self-hosted site doesn't expose the connect flow publicly. After authorizing, you paste the shown refresh token into your Docker env as `TIKTOK_REFRESH_TOKEN` and restart the container.

### 2. Runtime feed route — hybrid (rewrite `src/routes/api/tiktok/latest.ts`)
Selection order inside the `GET` handler (all reads inside the handler, per Worker rules):
1. **Self-host path** — if `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, and `TIKTOK_REFRESH_TOKEN` are set: exchange the refresh token for a fresh access token, cache it in a module-scope variable until ~1 min before expiry (in-memory refresh, no storage), then `POST video/list` directly to `https://open.tiktokapis.com/v2/video/list/`.
2. **Lovable path** — else if `LOVABLE_API_KEY` + `TIKTOK_API_KEY` are set: existing gateway call (unchanged).
3. **Fallback** — else return `[]` (page shows the hardcoded clips).

Response shape (`LatestTikTokVideo[] = { id, url }`) stays identical, so `behind-the-scenes.tsx` and its fallback list need **no changes**.

### 3. Config + secrets
- New secrets (you supply after creating the TikTok app): `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN`, plus a generated `TIKTOK_ADMIN_TOKEN`. On Lovable these go in project secrets; for Docker they go in your env/compose file.
- Add all four to `.env.example` with comments.
- Compute the redirect URI from the request origin at runtime so it works on both the Lovable preview domain and your self-hosted domain (the exact value must also be registered in the TikTok app).

### 4. Docs
Add a short `TIKTOK_SETUP.md`: create the TikTok developer app, add the redirect URI, request `video.list` scope, set the four env vars, hit `/api/tiktok/auth/start?key=...` once, copy the refresh token, set `TIKTOK_REFRESH_TOKEN`, redeploy.

## Files
- `src/routes/api/tiktok/latest.ts` — rewrite to hybrid (self-host direct API → gateway → empty).
- `src/routes/api/tiktok/auth/start.ts` — new: begin OAuth, redirect to TikTok.
- `src/routes/api/tiktok/auth/callback.ts` — new: token exchange + show refresh token.
- `src/lib/tiktok.server.ts` — new: helpers (build authorize URL, code→token exchange, refresh→access token with in-memory cache, video.list call, response mapping).
- `.env.example` — document the new vars.
- `TIKTOK_SETUP.md` — new: setup + authorize walkthrough.

## Notes / trade-offs
- **In-memory refresh** means the access token cache resets on container restart (fine — it just refreshes again). The long-lived **refresh token** lives only in env; if TikTok ever rotates it (it can return a new one on refresh), the in-memory copy is used for the container's lifetime, but you'd update the env value on next restart. This matches the "Env vars + in-memory refresh" choice; if you later want rotations to survive restarts, we can add the writable-token-file option.
- No changes to the page UI or the graceful fallback behavior.
- The TikTok app must be approved/live for production video.list access; in sandbox mode only authorized test users return data.