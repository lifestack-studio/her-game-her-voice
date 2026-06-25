import jerseyHome from "@/assets/jersey-home.jpg";
import jerseyAway from "@/assets/jersey-away.jpg";
import jerseySpecial from "@/assets/jersey-special.jpg";

export const JERSEY_PRICE = 65;

export const JERSEY_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type JerseySize = (typeof JERSEY_SIZES)[number];

export type Jersey = {
  slug: string;
  name: string;
  image: string;
};

export const JERSEYS: Jersey[] = [
  { slug: "home", name: "Home Jersey — Navy", image: jerseyHome },
  { slug: "away", name: "Away Jersey — White", image: jerseyAway },
  { slug: "special", name: "Limited Edition — Coral", image: jerseySpecial },
];

export function getJersey(slug: string): Jersey | undefined {
  return JERSEYS.find((j) => j.slug === slug);
}

export const SIZING_GUIDE_URL = "https://www.rhinosports.co.uk/5-panel-pro-v-neck/";
