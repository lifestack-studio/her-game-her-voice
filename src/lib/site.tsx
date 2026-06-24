import type { ReactElement } from "react";
import { Instagram, Linkedin, Music2 } from "lucide-react";
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
  { label: "Behind the Scenes", to: "/behind-the-scenes" },
  { label: "Contact", to: "/contact" },
] as const;


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
  Icon: LucideIcon | (({ className }: { className?: string }) => ReactElement);
}[] = [
  { label: "Instagram", href: "https://www.instagram.com/hghvpodcast", Icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/her-game-her-voice", Icon: Linkedin },
  { label: "TikTok", href: "https://www.tiktok.com/@hghvpodcast", Icon: TikTokIcon },
  { label: "Spotify", href: SPOTIFY_SHOW_URL, Icon: SpotifyIcon}
  { label: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/her-game-her-voice/id1825002407", Icon: AppleIcon,
  }
];

export const SPOTIFY_ICON = Music2;
