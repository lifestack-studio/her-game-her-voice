import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";
import {
  exchangeCodeForTokens,
  getRedirectUri,
  isAuthorizedAdmin,
} from "@/lib/tiktok.server";

/**
 * GET /api/tiktok/auth/callback?code=...&state=...
 *
 * TikTok redirects here after authorization. Exchanges the code for tokens and
 * renders a minimal page showing the refresh token to copy into your env as
 * TIKTOK_REFRESH_TOKEN. The `state` value carries the admin token for re-auth.
 */
function htmlPage(title: string, body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:640px;margin:3rem auto;padding:0 1rem;color:#1f1f1f;line-height:1.5}code,pre{background:#f4f4f5;border-radius:8px}pre{padding:1rem;overflow:auto;white-space:pre-wrap;word-break:break-all}h1{font-size:1.4rem}.ok{color:#15803d}.err{color:#b91c1c}</style></head><body>${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/tiktok/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        if (error) {
          return htmlPage(
            "TikTok authorization failed",
            `<h1 class="err">Authorization failed</h1><p>TikTok returned: <code>${error}</code> — ${url.searchParams.get("error_description") ?? ""}</p>`,
            400,
          );
        }

        // Re-verify admin via the round-tripped state value.
        if (!isAuthorizedAdmin(state)) {
          return new Response("Forbidden", { status: 403 });
        }

        if (!code) {
          return htmlPage(
            "Missing code",
            `<h1 class="err">Missing authorization code</h1><p>No <code>code</code> parameter was returned by TikTok.</p>`,
            400,
          );
        }

        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
        if (!clientKey || !clientSecret) {
          return htmlPage(
            "Not configured",
            `<h1 class="err">Missing app credentials</h1><p>Set <code>TIKTOK_CLIENT_KEY</code> and <code>TIKTOK_CLIENT_SECRET</code>. See <code>TIKTOK_SETUP.md</code>.</p>`,
            500,
          );
        }

        const redirectUri = getRedirectUri(request);
        const tokens = await exchangeCodeForTokens(
          { clientKey, clientSecret },
          code,
          redirectUri,
        );

        if (!tokens.refresh_token) {
          return htmlPage(
            "Token exchange failed",
            `<h1 class="err">Could not get a refresh token</h1><p>TikTok returned: <code>${tokens.error ?? "unknown"}</code> — ${tokens.error_description ?? ""}</p>`,
            400,
          );
        }

        return htmlPage(
          "TikTok connected",
          `<h1 class="ok">✅ TikTok authorized</h1>
           <p>Copy this refresh token and set it as the <code>TIKTOK_REFRESH_TOKEN</code> environment variable on your server, then restart the container:</p>
           <pre>${tokens.refresh_token}</pre>
           <p>Granted scopes: <code>${tokens.scope ?? "(none reported)"}</code></p>
           <p>Once set, the Behind the Scenes page will pull the latest videos automatically. You can close this tab.</p>`,
        );
      },
    },
  },
});
