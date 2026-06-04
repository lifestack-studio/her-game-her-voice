import { createFileRoute } from "@tanstack/react-router";
import { Music2, Apple, Youtube } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { LazyIframe } from "@/components/lazy-iframe";
import { SPOTIFY_SHOW_URL, SPOTIFY_EMBED_URL } from "@/lib/site";

export const Route = createFileRoute("/episodes")({
  head: () => ({
    meta: [
      { title: "Episodes | Her Game, Her Voice" },
      {
        name: "description",
        content:
          "Every story deserves to be heard. Stream the latest episode of Her Game, Her Voice and subscribe wherever you listen to podcasts.",
      },
      { property: "og:title", content: "Episodes | Her Game, Her Voice" },
      {
        property: "og:description",
        content: "Every story deserves to be heard — stream the latest episode and subscribe.",
      },
      { property: "og:url", content: "/episodes" },
    ],
    links: [{ rel: "canonical", href: "/episodes" }],
  }),
  component: EpisodesPage,
});

const platforms = [
  {
    label: "Spotify",
    href: SPOTIFY_SHOW_URL,
    Icon: Music2,
    className: "bg-[#1DB954] text-white hover:brightness-95",
  },
  {
    label: "Apple Podcasts",
    href: "https://podcasts.apple.com/",
    Icon: Apple,
    className: "bg-[#000000] text-white hover:brightness-125",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@hergamehervoice",
    Icon: Youtube,
    className: "bg-[#FF0000] text-white hover:brightness-95",
  },
];

function EpisodesPage() {
  return (
    <>
      <PageHero title="Episodes" subtitle="Every story deserves to be heard" />

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Latest Episode
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Press play and meet the women rewriting the rulebook.
            </p>
          </div>
          <LazyIframe
            src={SPOTIFY_EMBED_URL}
            title="Her Game, Her Voice — latest episode on Spotify"
            height={500}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="overflow-hidden rounded-2xl shadow-lift"
          />
        </div>
      </section>

      <section className="bg-secondary/20 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Subscribe wherever you listen
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {platforms.map(({ label, href, Icon, className }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold shadow-card transition ${className}`}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
