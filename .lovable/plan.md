# Her Game, Her Voice × lifestack — Co-brand & Content Update

## Goal
Adopt the co-brand identity from the supplied pack throughout the site (Plum / Teal / Orange / Blush palette, Fraunces + Inter type, role-based usage), wire in lifestack as the presenting sponsor, and make the requested content removals and additions.

## 1. New design system (`src/styles.css`)
Replace the current Ice/Navy/Coral tokens with the co-brand tokens (exact hex from the pack):

- **Plum** `#430650` → `--primary` (headlines, nav, dominant surfaces) + full plum scale (50–900).
- **Teal** `#004F5C` → links & secondary actions / lifestack presence + teal scale (50–900).
- **Orange** `#FF4500` → accent marker only (small squares, underlines, highlights — never buttons or text). Functional fallback `#C73700` for text-on-orange.
- **Blush** `#F3DBE9` → soft surface tint. **Off-white** `#F8F8F9` background. **Ink** `#0E0E0E`.
- Body text uses neutral-700 `#433645` on white.
- Update gradients/shadows that referenced navy to use plum/teal.
- Keep the role rule: no section pairs large plum and teal fills together; orange stays rationed.

Typography:
- `--font-display` → **Fraunces** (editorial headlines).
- `--font-sans` → **Inter** (body / UI / lifestack zones).
- Update the Google Fonts `<link>` in `src/routes/__root.tsx` to load Fraunces + Inter (drop Outfit). Update `theme-color` meta to plum.

## 2. Buttons (`src/components/ui/button.tsx`)
- Repurpose the `coral` variant to a **plum** primary CTA (or add a `primary`/`teal` variant) so primary actions are plum, lifestack actions are teal — per the pack, never orange.
- `heroOutline` stays but recolored to work over plum/teal heroes.
- Sweep components currently using `variant="coral"` (header, footer, home, about, contact) so CTAs read as plum/teal correctly.

## 3. Presenter header strip (`src/components/site-header.tsx`)
- Add a slim bar above the main nav, shown site-wide: **"Her Game, Her Voice is brought to you by lifestack"** with the lifestack logo (links to https://lifestack.studio, new tab, `rel="noopener noreferrer"`).
- Strip uses a teal (lifestack presence) treatment with the white lifestack mark, kept thin and quiet.

## 4. Sponsors section near the footer
- New section (rendered above `SiteFooter`, e.g. on the homepage and/or as a shared block) styled as a lifestack presenter zone:
  - "Presented by" eyebrow + lifestack logo, a short intro line, and a **"Discover lifestack"** button linking to https://lifestack.studio (new tab, `rel="noopener noreferrer"`).
- Logo variant follows brand rule: colour mark on light surface, white mark on dark.

## 5. Footer credit (`src/components/site-footer.tsx`)
- Add **"Web Design & Development by Declan Bianchi"** beside/under the existing "© 2025 Her Game, Her Voice. All rights reserved." line.

## 6. Content removals
- **Homepage** (`src/routes/index.tsx`): remove the entire "Behind the Scenes — On the ice, in the studio, and everywhere in between" gallery section and its images/imports.
- **About** (`src/routes/about.tsx`): remove the top-right game-action photo from the "Behind the Mic" gallery (drop the `gameAction` entry; keep the rest of the gallery).

## 7. Assets
- Upload the two lifestack logos (colour-on-white and white) as CDN assets via the assets CLI and reference them in the header strip + Sponsors section.

## Technical notes
- All colors defined as semantic tokens in `src/styles.css`; components use tokens, not raw hex.
- Verify contrast (pack pairings are WCAG AAA) and that orange is never used as a button/text fill.
- External links open in a new tab with `rel="noopener noreferrer"`.
- After changes, confirm the build is clean and spot-check home, about, and a sponsor link.

## Out of scope
- No new routes/pages, backend, or functional changes beyond styling, the two removals, and the sponsor/credit additions.
