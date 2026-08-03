# Add Jersey Promo Poster to Homepage

## Goal
Add the uploaded limited-edition jersey poster as a clickable homepage promo strip that links to the shop.

## Changes

1. **Add the image asset**
   - Copy the uploaded poster from the user-uploads mount into `src/assets/jersey-poster.png` as a real project file (matching the existing real-file preference for site assets).

2. **Insert a new promo strip on the homepage**
   - In `src/routes/index.tsx`, add a new full-width section below the existing blush brand banner strip and above the mission-statement section.
   - Render the poster as a responsive image inside a centred container (`max-w-[1900px]` to match the existing banner strip).
   - Wrap the image in a `<Link to="/shop">` so the whole strip is clickable.
   - Add hover state (subtle scale or opacity lift) to indicate interactivity.
   - Provide descriptive `alt` text referencing the limited-edition jersey and link to shop.

3. **Verify**
   - Run `bun run build` to confirm the new asset import and route changes compile cleanly.
   - Check the preview to ensure the poster is visible, responsive, and links to `/shop`.
