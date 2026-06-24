import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { NAV_LINKS, SOCIAL_LINKS, CONTACT_EMAIL } from "@/lib/site";
import ehHockey from "@/assets/eh-hockey-repair-shop.png.asset.json";
import lmCatering from "@/assets/lm-catering.png.asset.json";
import lifestackWhite from "@/assets/lifestack-white.png.asset.json";

const SPONSORS = [
  { name: "lifestack", src: lifestackWhite.url, href: "https://lifestack.studio" },
  { name: "Eh! Hockey Repair Shop", src: ehHockey.url, href: null },
  { name: "L&M Catering", src: lmCatering.url, href: null },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Thanks for subscribing! Watch your inbox for updates.");
    setEmail("");
  };

  return (
    <footer className="bg-navy-gradient text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="max-w-xs text-sm text-white/70">
              Women changing the face of ice hockey, one story at a time.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-white transition-colors"
            >
              <Mail className="size-4" />
              {CONTACT_EMAIL}
            </a>
          </div>

          <nav aria-label="Footer" className="md:justify-self-center">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-white/60">
              Explore
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/80 transition-colors hover:text-blush"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-white/60">
              Stay in the loop
            </h2>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button type="submit" variant="onDark">
                Subscribe
              </Button>
            </form>

            <div>
              <p className="mb-3 text-sm text-white/60">Follow the journey</p>
              <ul className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-accent"
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-10">
          <h2 className="text-center font-display text-sm font-semibold uppercase tracking-wide text-white/60">
            Our Sponsors
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
            {SPONSORS.map((sponsor) => {
              const img = (
                <img
                  src={sponsor.src}
                  alt={sponsor.name}
                  loading="lazy"
                  className="h-16 w-auto object-contain"
                />
              );
              return (
                <li key={sponsor.name}>
                  {sponsor.href ? (
                    <a
                      href={sponsor.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${sponsor.name} — opens in a new tab`}
                      className="inline-flex transition-opacity hover:opacity-80"
                    >
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-center text-sm text-white/50 sm:flex-row sm:text-left">
          <p>© 2025 Her Game, Her Voice. All rights reserved.</p>
          <p>Web Design &amp; Development by Declan Bianchi</p>
        </div>
      </div>
    </footer>
  );
}
