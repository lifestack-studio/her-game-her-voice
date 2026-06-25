import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";
import {
  buildAuthorizeUrl,
  getRedirectUri,
  isAuthorizedAdmin,
} from "@/lib/tiktok.server";

/**
 * GET /api/tiktok/auth/start?key=ADMIN_TOKEN
 *
 * One-time onboarding step. Redirects to TikTok's authorize screen so you can
 * log in as @hghvpodcast and grant video.list access. Gated by
 * TIKTOK_ADMIN_TOKEN so the connect flow isn't publicly reachable.
 *
 * The redirect URI (this app's /api/tiktok/auth/callback) must be registered
 * in your TikTok for Developers app.
 */
export const Route = createFileRoute("/api/tiktok/auth/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const providedKey = url.searchParams.get("key");

        if (!isAuthorizedAdmin(providedKey)) {
          return new Response("Forbidden", { status: 403 });
        }

        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        if (!clientKey) {
          return new Response(
            "TIKTOK_CLIENT_KEY is not configured. See TIKTOK_SETUP.md.",
            { status: 500 },
          );
        }

        const redirectUri = getRedirectUri(request);
        // CSRF state: echo the admin key back through the round-trip so the
        // callback can re-verify without a shared session store.
        const state = providedKey as string;
        const authorizeUrl = buildAuthorizeUrl(clientKey, redirectUri, state);

        return new Response(null, {
          status: 302,
          headers: { Location: authorizeUrl },
        });
      },
    },
  },
});
