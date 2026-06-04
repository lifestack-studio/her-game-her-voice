import { Instagram, Linkedin, Facebook, Youtube, Music2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SPOTIFY_SHOW_URL =
  "https://open.spotify.com/show/3H4XRlV2oIFAS9u9Z5vvme";
export const SPOTIFY_EMBED_URL =
  "https://open.spotify.com/embed/show/3H4XRlV2oIFAS9u9Z5vvme?utm_source=generator&theme=0";
export const SHOP_URL = "https://HerGameHerVoice.shop";
export const CONTACT_EMAIL = "estigter@outlook.com";

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Episodes", to: "/episodes" },
  { label: "Shop", to: "/shop" },
  { label: "Bloopers", to: "/bloopers" },
  { label: "Contact", to: "/contact" },
] as const;

// X (Twitter) has no current lucide icon; use a custom glyph component.
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

export const SOCIAL_LINKS: {
  label: string;
  href: string;
  Icon: LucideIcon | (({ className }: { className?: string }) => JSX.Element);
}[] = [
  { label: "Instagram", href: "https://instagram.com/hergamehervoice", Icon: Instagram },
  { label: "X (Twitter)", href: "https://x.com/hergamehervoice", Icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com/company/hergamehervoice", Icon: Linkedin },
  { label: "Facebook", href: "https://facebook.com/hergamehervoice", Icon: Facebook },
  { label: "YouTube", href: "https://youtube.com/@hergamehervoice", Icon: Youtube },
  { label: "TikTok", href: "https://tiktok.com/@hergamehervoice", Icon: TikTokIcon },
];

export const SPOTIFY_ICON = Music2;
