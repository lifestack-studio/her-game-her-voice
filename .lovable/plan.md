# Three updates: tagline font, page headers, latest episodes

## 1. "lifestack" in Inter Semibold (homepage)

In `src/components/presented-by.tsx`, the heading "Her Game, Her Voice is brought to you by lifestack" currently renders entirely in Fraunces (`font-display`). Wrap the word **lifestack** in a span styled with Inter Semibold (`font-sans font-semibold`) so only that word switches typeface, keeping the rest in the display font and lowercase per brand.

## 2. Remove the messy banner from interior page headers

All five interior pages (About, Episodes, Shop, Bloopers, Contact) share one component: `src/components/page-hero.tsx`. It currently layers the `brand-banner.png` image (object-cover, mix-blend) over a navy gradient — this is the messy element.

Replace it with a **clean plum → teal brand gradient band**:
- Drop the `brandBanner` image import and `<img>` entirely.
- Use an on-brand gradient background (plum to teal) defined via a token in `src/styles.css` (e.g. a `--gradient-brand` / `bg-brand-gradient` utility) instead of `bg-navy-gradient`.
- Keep the title (Fraunces, white) and subtitle, plus the existing decorative ring accent for visual interest.
- Preserve the `children` slot (Bloopers passes content into the hero).

Because every interior page uses `PageHero`, this single edit updates all five at once. No per-page changes needed (the homepage hero is separate and untouched).

## 3. Latest 3 episodes on the Episodes page (Spotify-powered)

Rework `src/routes/episodes.tsx` to add a **Latest Episodes** section near the top that shows the 3 newest episodes as cards plus one shared, switchable Spotify player. The full all-episodes show embed is removed (you chose "latest 3 only"); the "Subscribe wherever you listen" section stays.

### Frontend (this project)
- **Types** — new `src/lib/podcast.ts` with an `Episode` interface matching your contract: `id`, `spotifyUri`, `name`, `description`, `releaseDate`, `image`, `spotifyUrl`.
- **API client** — small helper in `src/lib/podcast.ts` that fetches `GET /api/podcast/latest` and returns `Episode[]`, wired through a TanStack Query `queryOptions` (the project standard).
- **EpisodeCard** component — artwork, title, formatted release date, truncated description, a "Listen on Spotify" external link (`target="_blank" rel="noopener noreferrer"`), and a "Play here" button. Active card gets a clear selected state (plum ring/border). Fully keyboard-accessible with visible focus.
- **SpotifyPlayer** component — loads the Spotify iFrame API script once, creates one reusable embed controller, and switches episodes by URI without rebuilding layout. Responsive; first episode auto-selected on load.
- **States** — skeleton cards + player placeholder while loading; friendly empty state ("No episodes available right now."); error state with a non-technical message and a Retry button.
- **Layout** — two-column on desktop (cards beside player), stacked on mobile (cards above player). Reuses existing `Card`, `Button`, `Skeleton` primitives and current spacing/section styling.

### Backend endpoint `/api/podcast/latest`
Your spec says to assume the backend exposes this. Since this whole project runs server-side in your Docker container, the cleanest fit is a **TanStack server route** at `src/routes/api/podcast/latest.ts` — it runs only on the server, so the Spotify secret never touches the browser. It will:
- Use the Spotify Client Credentials flow (server-side token fetch) to call the Spotify API for show `3H4XRlV2oIFAS9u9Z5vvme`, take the 3 newest episodes, map to the contract shape, and return JSON.
- Read `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` from server env (stored as secrets, never in frontend).

If you'd rather point at a separate backend you maintain, we keep the exact same frontend and just leave a TODO at the fetch URL — the frontend is backend-agnostic either way.

## Files touched
- `src/components/presented-by.tsx` — Inter Semibold "lifestack"
- `src/components/page-hero.tsx` — clean plum gradient header, banner removed
- `src/styles.css` — add brand gradient token
- `src/routes/episodes.tsx` — Latest Episodes section, remove full show embed
- `src/lib/podcast.ts` (new) — types + API client + query options
- `src/components/episode-card.tsx`, `src/components/spotify-player.tsx` (new)
- `src/routes/api/podcast/latest.ts` (new, optional backend route)

## Backend assumptions
- Endpoint: `GET /api/podcast/latest` returning `Episode[]` in your specified shape.
- If implemented here: requires `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` secrets; no Spotify credentials ever ship to the browser.
- Spotify show ID: `3H4XRlV2oIFAS9u9Z5vvme` (from existing config).
