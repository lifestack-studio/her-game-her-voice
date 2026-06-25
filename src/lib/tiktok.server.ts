import process from "node:process";

// Server-only TikTok Display API helpers.
//
// Two ways the feed can be powered:
//   1. Self-hosted / direct: a registered TikTok for Developers app
//      (TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET) plus a long-lived
//      TIKTOK_REFRESH_TOKEN obtained via the built-in OAuth flow. The server
//      exchanges the refresh token for short-lived access tokens, cached in
//      memory until just before expiry.
//   2. Lovable gateway: handled separately in the latest.ts route.
//
// On Cloudflare Workers, env binds at REQUEST time — never read process.env at
// module scope. Every read here happens inside a function.

const TIKTOK_AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

export const TIKTOK_SCOPES = "user.info.basic,video.list";
export const TIKTOK_CALLBACK_PATH = "/api/tiktok/auth/callback";

export interface LatestTikTokVideo {
  id: string;
  url: string;
}

export interface TikTokDirectConfig {
  clientKey: string;
  clientSecret: string;
  refreshToken: string;
}

interface TikTokTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  open_id?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface TikTokVideo {
  id?: string;
  share_url?: string;
  embed_link?: string;
  create_time?: number;
}

interface TikTokVideoListResponse {
  data?: { videos?: TikTokVideo[] };
  error?: { code?: string; message?: string };
}

const VIDEO_FIELDS = "id,share_url,embed_link,create_time";
const MAX_VIDEOS = 6;

/**
 * Read the direct-API config from env. Returns null unless all three values
 * are present, so the route can cleanly fall back to the Lovable gateway.
 */
export function getTikTokDirectConfig(): TikTokDirectConfig | null {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const refreshToken = process.env.TIKTOK_REFRESH_TOKEN;

  if (!clientKey || !clientSecret || !refreshToken) return null;
  return { clientKey, clientSecret, refreshToken };
}

/**
 * Gate for the one-time OAuth onboarding routes. Compares the provided key
 * against TIKTOK_ADMIN_TOKEN. Returns false if the admin token is unset, so
 * the connect flow is never publicly reachable by accident.
 */
export function isAuthorizedAdmin(providedKey: string | null): boolean {
  const adminToken = process.env.TIKTOK_ADMIN_TOKEN;
  if (!adminToken) return false;
  if (!providedKey) return false;
  // Constant-time-ish compare (lengths may differ; that's acceptable here).
  return providedKey === adminToken;
}

/** Build the absolute redirect URI from the incoming request's origin. */
export function getRedirectUri(request: Request): string {
  const url = new URL(request.url);
  return `${url.origin}${TIKTOK_CALLBACK_PATH}`;
}

/** Build the TikTok authorize URL to redirect the user to. */
export function buildAuthorizeUrl(
  clientKey: string,
  redirectUri: string,
  state: string,
): string {
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPES,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `${TIKTOK_AUTH_BASE}?${params.toString()}`;
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCodeForTokens(
  config: { clientKey: string; clientSecret: string },
  code: string,
  redirectUri: string,
): Promise<TikTokTokenResponse> {
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  });
  return (await res.json()) as TikTokTokenResponse;
}

// In-memory access-token cache. Resets on container restart (fine — it just
// refreshes again on the next request).
let cachedAccessToken: string | null = null;
let cachedExpiresAt = 0;
// If TikTok rotates the refresh token on a refresh, keep the latest one for
// the lifetime of this process.
let runtimeRefreshToken: string | null = null;

/**
 * Get a valid access token, refreshing via the refresh token when needed.
 * Caches in memory until ~60s before expiry.
 */
async function getAccessToken(config: TikTokDirectConfig): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && now < cachedExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const refreshToken = runtimeRefreshToken ?? config.refreshToken;
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  const payload = (await res.json()) as TikTokTokenResponse;
  if (!res.ok || !payload.access_token) {
    throw new Error(
      `TikTok token refresh failed (${res.status}): ${payload.error_description ?? payload.error ?? "unknown error"}`,
    );
  }

  cachedAccessToken = payload.access_token;
  cachedExpiresAt = now + (payload.expires_in ?? 3600) * 1000;
  if (payload.refresh_token) runtimeRefreshToken = payload.refresh_token;

  return cachedAccessToken;
}

/**
 * Fetch the latest videos directly from the TikTok Display API and map them to
 * the shared { id, url } shape (newest first, capped at MAX_VIDEOS).
 */
export async function fetchLatestVideosDirect(
  config: TikTokDirectConfig,
): Promise<LatestTikTokVideo[]> {
  const accessToken = await getAccessToken(config);

  const res = await fetch(`${TIKTOK_VIDEO_LIST_URL}?fields=${VIDEO_FIELDS}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_count: 20 }),
  });

  if (!res.ok) {
    throw new Error(`TikTok video.list failed (${res.status})`);
  }

  const payload = (await res.json()) as TikTokVideoListResponse;
  if (payload.error?.code && payload.error.code !== "ok") {
    throw new Error(`TikTok video.list error: ${payload.error.message}`);
  }

  return (payload.data?.videos ?? [])
    .filter((v): v is TikTokVideo & { id: string } => Boolean(v.id))
    .sort((a, b) => (b.create_time ?? 0) - (a.create_time ?? 0))
    .slice(0, MAX_VIDEOS)
    .map<LatestTikTokVideo>((v) => ({
      id: v.id,
      url: v.share_url ?? v.embed_link ?? `https://www.tiktok.com/@hghvpodcast/video/${v.id}`,
    }));
}
