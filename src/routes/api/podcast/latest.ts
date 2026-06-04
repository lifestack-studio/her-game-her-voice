import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/podcast/latest
 *
 * Returns the 3 most recent episodes of the show using Spotify's
 * Client Credentials flow. Runs server-side only — Spotify credentials are
 * read from env and never reach the browser.
 *
 * Required server env (stored as secrets, not in frontend code):
 *   - SPOTIFY_CLIENT_ID
 *   - SPOTIFY_CLIENT_SECRET
 */

const SHOW_ID = "3H4XRlV2oIFAS9u9Z5vvme";
const MARKET = "GB";

interface SpotifyEpisode {
  id: string;
  uri: string;
  name: string;
  description: string;
  release_date: string;
  images: { url: string }[];
  external_urls: { spotify: string };
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Spotify token request failed (${res.status})`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Spotify token missing in response");
  return data.access_token;
}

export const Route = createFileRoute("/api/podcast/latest")({
  server: {
    handlers: {
      GET: async () => {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
          return Response.json(
            { error: "Spotify credentials are not configured." },
            { status: 503 },
          );
        }

        try {
          const token = await getAccessToken(clientId, clientSecret);

          const res = await fetch(
            `https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?market=${MARKET}&limit=3`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!res.ok) {
            console.error(`Spotify episodes request failed: ${res.status}`);
            return Response.json(
              { error: `Failed to load episodes (${res.status})` },
              { status: 502 },
            );
          }

          const payload = (await res.json()) as { items: (SpotifyEpisode | null)[] };
          const episodes = (payload.items ?? [])
            .filter((e): e is SpotifyEpisode => Boolean(e))
            .slice(0, 3)
            .map((e) => ({
              id: e.id,
              spotifyUri: e.uri,
              name: e.name,
              description: e.description,
              releaseDate: e.release_date,
              image: e.images?.[0]?.url ?? "",
              spotifyUrl: e.external_urls?.spotify ?? "",
            }));

          return Response.json(episodes, {
            headers: { "Cache-Control": "public, max-age=600" },
          });
        } catch (error) {
          console.error("Failed to fetch latest episodes:", error);
          return Response.json(
            { error: "Podcast service is currently unavailable." },
            { status: 502 },
          );
        }
      },
    },
  },
});
