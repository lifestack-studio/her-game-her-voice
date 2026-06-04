import { createFileRoute } from "@tanstack/react-router";
import { XMLParser } from "fast-xml-parser";

/**
 * GET /api/podcast/latest
 *
 * Returns the 3 most recent episodes by reading the podcast's RSS feed.
 * Runs server-side only — the feed URL is read from env and never reaches
 * the browser.
 *
 * Required server env (stored as a secret, not in frontend code):
 *   - PODCAST_RSS_URL  (the show's RSS feed URL, supplied by the client)
 */

interface RssItem {
  title?: string;
  description?: string;
  "itunes:summary"?: string;
  pubDate?: string;
  link?: string;
  guid?: string | { "#text"?: string };
  "itunes:image"?: { "@_href"?: string };
  enclosure?: { "@_url"?: string };
}

interface ParsedFeed {
  rss?: {
    channel?: {
      "itunes:image"?: { "@_href"?: string };
      image?: { url?: string };
      item?: RssItem | RssItem[];
    };
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

/** Strip HTML tags and collapse whitespace for a clean text description. */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function guidText(guid: RssItem["guid"]): string | undefined {
  if (!guid) return undefined;
  return typeof guid === "string" ? guid : guid["#text"];
}

export const Route = createFileRoute("/api/podcast/latest")({
  server: {
    handlers: {
      GET: async () => {
        const feedUrl = process.env.PODCAST_RSS_URL;

        if (!feedUrl) {
          return Response.json(
            { error: "Podcast feed is not configured yet." },
            { status: 503 },
          );
        }

        try {
          const res = await fetch(feedUrl, {
            headers: { Accept: "application/rss+xml, application/xml, text/xml" },
          });
          if (!res.ok) {
            console.error(`RSS feed request failed: ${res.status}`);
            return Response.json(
              { error: `Failed to load episodes (${res.status})` },
              { status: 502 },
            );
          }

          const xml = await res.text();
          const parsed = parser.parse(xml) as ParsedFeed;
          const channel = parsed.rss?.channel;

          const rawItems = channel?.item;
          const items: RssItem[] = Array.isArray(rawItems)
            ? rawItems
            : rawItems
              ? [rawItems]
              : [];

          const channelImage =
            channel?.["itunes:image"]?.["@_href"] ?? channel?.image?.url ?? "";

          const episodes = items.slice(0, 3).map((item, index) => {
            const link = item.link ?? guidText(item.guid) ?? "";
            const id = guidText(item.guid) ?? `episode-${index}`;
            const rawDescription =
              item.description ?? item["itunes:summary"] ?? "";

            return {
              id,
              name: item.title ?? "Untitled episode",
              description: stripHtml(rawDescription).slice(0, 300),
              releaseDate: item.pubDate ?? "",
              image: item["itunes:image"]?.["@_href"] ?? channelImage,
              audioUrl: item.enclosure?.["@_url"] ?? "",
              spotifyUrl: link,
            };
          });

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
