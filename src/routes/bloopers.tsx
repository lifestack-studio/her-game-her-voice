import { createFileRoute, Link } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { LazyIframe } from "@/components/lazy-iframe";

export const Route = createFileRoute("/bloopers")({
  head: () => ({
    meta: [
      { title: "Behind the Scenes | Her Game, Her Voice" },
      {
        name: "description",
        content:
          "The moments between the moments. Watch bloopers and behind-the-scenes B-roll from the Her Game, Her Voice podcast.",
      },
      { property: "og:title", content: "Behind the Scenes | Her Game, Her Voice" },
      {
        property: "og:description",
        content: "The moments between the moments — bloopers and behind-the-scenes footage.",
      },
      { property: "og:url", content: "/bloopers" },
    ],
    links: [{ rel: "canonical", href: "/bloopers" }],
  }),
  component: BloopersPage,
});

/**
 * Convert a YouTube or Vimeo watch URL into an embeddable iframe URL.
 * Admin: add videos to the `videos` array below using normal share URLs.
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

type Video = { title: string; description?: string; url?: string };

// Admin: paste YouTube/Vimeo URLs here to publish clips.
const videos: Video[] = [
  { title: "Coming Soon" },
  { title: "Coming Soon" },
  { title: "Coming Soon" },
  { title: "Coming Soon" },
];

function BloopersPage() {
  return (
    <>
      <PageHero title="Behind the Scenes" subtitle="The moments between the moments">
        <p className="mt-3 max-w-xl text-white/70">
          Not everything makes the final cut… and that’s probably a good thing.
        </p>
      </PageHero>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {videos.map((video, i) => {
              const embed = video.url ? toEmbedUrl(video.url) : null;
              return (
                <article
                  key={`${video.title}-${i}`}
                  className="overflow-hidden rounded-2xl bg-card shadow-card"
                >
                  {embed ? (
                    <LazyIframe
                      src={embed}
                      title={video.title}
                      height="100%"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      className="aspect-video w-full"
                    />
                  ) : (
                    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-navy-gradient text-white/70">
                      <Film className="size-9" aria-hidden="true" />
                      <span className="font-display text-sm font-semibold uppercase tracking-wide">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="font-display text-lg font-bold text-primary">{video.title}</h2>
                    {video.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{video.description}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Got footage we should see?
          </h2>
          <Button asChild variant="coral" size="lg">
            <Link to="/contact">Send It Our Way</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
