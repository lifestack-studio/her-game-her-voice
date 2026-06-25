import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";
import {
  fetchLatestVideosDirect,
  getTikTokDirectConfig,
  type LatestTikTokVideo,
} from "@/lib/tiktok.server";

/**
 * GET /api/tiktok/latest
 *
 * Returns the most recent @hghvpodcast TikTok videos as { id, url }[].
 *
 * Hybrid source selection (first available wins):
 *   1. Direct TikTok Display API — fully self-hosted path. Uses your own
 *      developer app (TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET +
 *      TIKTOK_REFRESH_TOKEN). Works anywhere, including Docker outside Lovable.
 *      See TIKTOK_SETUP.md Path B.
 *   2. Lovable connector gateway — reuse the Lovable-managed TikTok connection
 *      on any server (including self-hosted) by copying LOVABLE_API_KEY and
 *      TIKTOK_API_KEY into the server env. See TIKTOK_SETUP.md Path A.
 *   3. Empty list — the page falls back to its hardcoded clips.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/tiktok";
const MAX_VIDEOS = 6;
const VIDEO_FIELDS =
  "id,share_url,embed_link,cover_image_url,create_time,video_description";

interface TikTokVideo {
  id?: string;
  share_url?: string;
  embed_link?: string;
  create_time?: number;
}

interface TikTokListResponse {
  data?: { videos?: TikTokVideo[] };
  error?: { code?: string; message?: string };
}

export type { LatestTikTokVideo };

function jsonList(videos: LatestTikTokVideo[], maxAge: number): Response {
  return Response.json(videos, {
    headers: { "Cache-Control": `public, max-age=${maxAge}` },
  });
}

async function fetchViaGateway(
  lovableApiKey: string,
  tiktokApiKey: string,
): Promise<LatestTikTokVideo[]> {
  const res = await fetch(`${GATEWAY_URL}/video/list/?fields=${VIDEO_FIELDS}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": tiktokApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_count: 20 }),
  });

  if (!res.ok) {
    throw new Error(`TikTok gateway request failed: ${res.status}`);
  }

  const payload = (await res.json()) as TikTokListResponse;
  if (payload.error?.code && payload.error.code !== "ok") {
    throw new Error(`TikTok gateway error: ${payload.error.message}`);
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

export const Route = createFileRoute("/api/tiktok/latest")({
  server: {
    handlers: {
      GET: async () => {
        // 1. Direct TikTok Display API (self-hosted path).
        const directConfig = getTikTokDirectConfig();
        if (directConfig) {
          try {
            const videos = await fetchLatestVideosDirect(directConfig);
            return jsonList(videos, 3600);
          } catch (error) {
            console.error("TikTok direct API failed:", error);
            return jsonList([], 300);
          }
        }

        // 2. Lovable connector gateway.
        const lovableApiKey = process.env.LOVABLE_API_KEY;
        const tiktokApiKey = process.env.TIKTOK_API_KEY;
        if (lovableApiKey && tiktokApiKey) {
          try {
            const videos = await fetchViaGateway(lovableApiKey, tiktokApiKey);
            return jsonList(videos, 3600);
          } catch (error) {
            console.error("TikTok gateway failed:", error);
            return jsonList([], 300);
          }
        }

        // 3. Nothing configured — let the page use its fallback list.
        return jsonList([], 300);
      },
    },
  },
});
