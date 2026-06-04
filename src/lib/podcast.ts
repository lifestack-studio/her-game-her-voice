import { queryOptions } from "@tanstack/react-query";

/** A single podcast episode as returned by GET /api/podcast/latest (RSS-powered). */
export interface Episode {
  id: string;
  spotifyUri: string;
  name: string;
  description: string;
  releaseDate: string;
  image: string;
  spotifyUrl: string;
}

/**
 * Fetch the latest episodes from our own backend.
 *
 * The frontend never talks to Spotify directly — the backend endpoint
 * `GET /api/podcast/latest` is responsible for using Spotify credentials
 * server-side and returning the shape above. In this project that endpoint
 * is implemented as a TanStack server route (src/routes/api/podcast/latest.ts),
 * but it can be swapped for any backend that honours the same contract.
 */
export async function fetchLatestEpisodes(): Promise<Episode[]> {
  const res = await fetch("/api/podcast/latest", {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load episodes (${res.status})`);
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected response from podcast endpoint");
  }

  return data as Episode[];
}

export const latestEpisodesQueryOptions = queryOptions({
  queryKey: ["podcast", "latest"],
  queryFn: fetchLatestEpisodes,
  staleTime: 1000 * 60 * 10, // 10 minutes
});

/** Human-friendly release date, e.g. "30 May 2026". */
export function formatReleaseDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
