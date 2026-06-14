import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/tiktok/latest
 *
 * Returns the 6 most recent videos from the connected @hghvpodcast TikTok
 * account, read server-side via the Lovable TikTok connector gateway.
 *
 * Requires the TikTok connector to be linked (provides TIKTOK_API_KEY and
 * gateway access via LOVABLE_API_KEY). Until then — or if TikTok errors — the
 * endpoint returns an empty list so the page can fall back gracefully.
 */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/tiktok";
const MAX_VIDEOS = 6;
const VIDEO_FIELDS =
  "id,share_url,embed_link,cover_image_url,create_time,video_description";

interface TikTokVideo {
  id?: string;
  share_url?: string;
  embed_link?: string;
  cover_image_url?: string;
  create_time?: number;
  video_description?: string;
}

interface TikTokListResponse {
  data?: { videos?: TikTokVideo[] };
  error?: { code?: string; message?: string };
}

export interface LatestTikTokVideo {
  id: string;
  url: string;
}

export const Route = createFileRoute("/api/tiktok/latest")({
  server: {
    handlers: {
      GET: async () => {
        const lovableApiKey = process.env.LOVABLE_API_KEY;
        const tiktokApiKey = process.env.TIKTOK_API_KEY;

        // Connector not linked yet — let the page use its fallback list.
        if (!lovableApiKey || !tiktokApiKey) {
          return Response.json([] as LatestTikTokVideo[], {
            headers: { "Cache-Control": "public, max-age=300" },
          });
        }

        try {
          const res = await fetch(
            `${GATEWAY_URL}/video/list/?fields=${VIDEO_FIELDS}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableApiKey}`,
                "X-Connection-Api-Key": tiktokApiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ max_count: 20 }),
            },
          );

          if (!res.ok) {
            console.error(`TikTok video list request failed: ${res.status}`);
            return Response.json([] as LatestTikTokVideo[], {
              headers: { "Cache-Control": "public, max-age=300" },
            });
          }

          const payload = (await res.json()) as TikTokListResponse;

          if (payload.error?.code && payload.error.code !== "ok") {
            console.error("TikTok API error:", payload.error.message);
            return Response.json([] as LatestTikTokVideo[], {
              headers: { "Cache-Control": "public, max-age=300" },
            });
          }

          const videos = (payload.data?.videos ?? [])
            .filter((v): v is TikTokVideo & { id: string } => Boolean(v.id))
            .sort((a, b) => (b.create_time ?? 0) - (a.create_time ?? 0))
            .slice(0, MAX_VIDEOS)
            .map<LatestTikTokVideo>((v) => ({
              id: v.id,
              url:
                v.share_url ??
                v.embed_link ??
                `https://www.tiktok.com/@hghvpodcast/video/${v.id}`,
            }));

          return Response.json(videos, {
            headers: { "Cache-Control": "public, max-age=3600" },
          });
        } catch (error) {
          console.error("Failed to fetch latest TikTok videos:", error);
          return Response.json([] as LatestTikTokVideo[], {
            headers: { "Cache-Control": "public, max-age=300" },
          });
        }
      },
    },
  },
});
