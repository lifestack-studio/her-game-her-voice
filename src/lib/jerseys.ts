import jerseyHome from "@/assets/jersey-home.jpg";

export const JERSEY_PRICE = 65;

export const JERSEY_SIZES = ["Baby","Toddler","5XS","4XS","3XS","2XS","XS","M","L","XL","2XL","3XL","4XL","5XL","Netminder (S)","Netminder (M)","Netminder (L)","Netminder (XL)"] as const;
export type JerseySize = (typeof JERSEY_SIZES)[number];

export type Jersey = {
  slug: string;
  name: string;
  image: string;
};

export const JERSEYS: Jersey[] = [
  { slug: "home", name: "Home Jersey — Navy", image: jerseyHome },
];

export function getJersey(slug: string): Jersey | undefined {
  return JERSEYS.find((j) => j.slug === slug);
}

export const SIZING_GUIDE_URL = "https://www.rhinosports.co.uk/5-panel-pro-v-neck/";
