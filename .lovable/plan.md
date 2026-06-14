# Auto-updating TikTok feed

Make the **Behind the Scenes** page pull the 6 most recent videos directly from the @hghvpodcast TikTok account, so the page refreshes itself whenever a new video is posted — no more pasting links by hand.

## How it will work

```text
TikTok (@hghvpodcast)
        │  video list (via Lovable TikTok connector)
        ▼
  /api/tiktok/latest   ──► returns 6 newest videos, cached ~1 hour
        ▼
Behind the Scenes page ──► renders 6 TikTok embeds automatically
```

1. The @hghvpodcast TikTok account gets connected to the project (you'll authorize this when we build — until then the page safely falls back to the current hardcoded list).
2. A small server endpoint asks TikTok for the account's latest videos, keeps the 6 newest, and caches the result for about an hour so the page loads fast.
3. The Behind the Scenes page shows those 6 videos instead of the manual list. When a new video is posted, it appears within the hour with no edits needed.

## What changes for you

- No more editing code to add TikTok links — posting on TikTok is enough.
- The page shows the **6** most recent videos in the existing card grid layout.
- The feed refreshes **hourly**.
- The "Follow @hghvpodcast" link and the rest of the page stay the same.

## Build steps (technical)

1. **Connect TikTok**: link the @hghvpodcast TikTok account via the Lovable TikTok connector (provides `TIKTOK_API_KEY` + gateway access). This is the one step that needs your login.
2. **New server route** `src/routes/api/tiktok/latest.ts`:
  - Calls the connector gateway `POST video/list/` (`https://connector-gateway.lovable.dev/tiktok/video/list/`) requesting fields `id, share_url, embed_link, cover_image_url, create_time, video_description`.
  - Sorts by `create_time` and returns the 6 newest as plain JSON `{ id, url }` objects.
  - Adds `Cache-Control: public, max-age=3600` (hourly refresh).
  - Mirrors the resilient pattern in `src/routes/api/podcast/latest.ts`: if the connector isn't configured yet or TikTok errors, returns a graceful fallback so the page never breaks.
3. **Update** `src/routes/behind-the-scenes.tsx`:
  - Replace the hardcoded `TIKTOK_VIDEO_URLS` array and the slice-to-3 logic with a TanStack Query loader (`ensureQueryData` + `useSuspenseQuery`) that fetches `/api/tiktok/latest`.
  - Keep the existing `getTikTokId` helper and `LazyIframe` embed cards; render up to 6 in the same grid.
  - Keep a small hardcoded fallback list so the page still shows clips before the account is connected or if the API is down.
  - Add `errorComponent` / `notFoundComponent` per route conventions.
4. **Layout note**: the grid already uses `lg:grid-cols-3`, so 6 videos fill two rows cleanly — no layout redesign needed.

## Note on TikTok access

TikTok's API only returns videos for the **connected** account, which is exactly what we want here (@hghvpodcast's own posts). The connector handles login and token refresh automatically. Until you authorize the account, the page keeps working from the fallback list.