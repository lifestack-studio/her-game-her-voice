# Switch the Episodes feed from Spotify API to RSS

You've decided to power the **Latest 3 episodes** from the podcast's **RSS feed** (no Spotify Client Credentials / client secret), while **keeping the Spotify embed player** for playback. The RSS URL will be supplied later by the client, so the code reads it from a server secret and degrades gracefully until it's set.

## What changes

### 1. Backend route `src/routes/api/podcast/latest.ts` (rewrite)
Replace the entire Spotify Client Credentials flow with RSS parsing:
- Remove `getAccessToken()`, the `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` logic, and the Spotify Web API calls.
- Read `PODCAST_RSS_URL` from server env. If it's not set yet, return `503` with a friendly `{ error }` (same pattern as today) so the page shows its empty/placeholder state until you supply the URL.
- `fetch()` the RSS XML server-side, parse it, take the **3 newest** `<item>` entries, and map each to the existing `Episode` shape.
- Keep the `Cache-Control: public, max-age=600` response header.

### 2. RSS parsing
- Cloudflare's Worker runtime has no `DOMParser`, so add a pure-JS, edge-safe XML parser (`fast-xml-parser`) and parse the feed with it.
- Map standard podcast RSS fields → `Episode`:
  - `name` ← `<title>`
  - `description` ← `<description>` / `<itunes:summary>` (HTML stripped, truncated)
  - `releaseDate` ← `<pubDate>`
  - `image` ← `<itunes:image href>` (item-level, falling back to channel image)
  - `spotifyUrl` ← the item `<link>` (or guid) when it's an `open.spotify.com/episode/...` URL
  - `spotifyUri` ← derived `spotify:episode:{id}` from that link, used by the embed player to switch episodes

### 3. `src/lib/podcast.ts` (minor)
- Keep the `Episode` interface, `fetchLatestEpisodes()`, `latestEpisodesQueryOptions`, and `formatReleaseDate()` — they're transport-agnostic and still point at `/api/podcast/latest`.
- No structural change needed; only comments updated to say "RSS-powered" instead of "Spotify API".

### 4. `src/routes/episodes.tsx` (wire up the parked UI)
- Swap the current single `LazyIframe` show-embed for the **Latest Episodes** section: 3 `EpisodeCard`s beside one shared `SpotifyPlayer`, loaded via TanStack Query (`latestEpisodesQueryOptions`), with skeleton / empty / error+retry states.
- Keep the "Subscribe wherever you listen" section unchanged.

### 5. Keep (still relevant)
- `src/components/episode-card.tsx` and `src/components/spotify-player.tsx` — reused as-is.

## Code/files removed or no longer relevant
- Spotify Client Credentials token flow and all `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` references in `latest.ts` (deleted).
- No Spotify API secrets exist in the project, so none need deleting.
- `docker-compose.yml` / `DEPLOY.md` references to `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` are updated to `PODCAST_RSS_URL` so the deploy docs stay accurate.

## Files touched
- `src/routes/api/podcast/latest.ts` — rewrite to RSS parsing
- `src/routes/episodes.tsx` — use cards + player instead of single embed
- `src/lib/podcast.ts` — comment-only updates
- `package.json` — add `fast-xml-parser`
- `docker-compose.yml`, `DEPLOY.md` — swap Spotify creds env for `PODCAST_RSS_URL`

## Backend assumptions
- Endpoint stays `GET /api/podcast/latest`, returns `Episode[]` (latest 3).
- Requires one server secret: **`PODCAST_RSS_URL`** (the feed URL you'll get from the client). I'll add it as a secret when you have it; until then the page shows the empty/placeholder state.
- The Spotify embed player needs a `spotify:episode:{id}` per episode. This works when the feed is the **Spotify-distributed RSS feed** (item links/guids are `open.spotify.com/episode/...`). If the supplied feed doesn't expose Spotify episode URLs, we'll either fall back to a single show-embed player or switch the player to native audio from the RSS `<enclosure>` — I'll confirm once I see the feed.
