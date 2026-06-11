import { createFileRoute, Link } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { LazyIframe } from "@/components/lazy-iframe";

export const Route = createFileRoute("/behind-the-scenes")({
  head: () => ({
    meta: [
      { title: "Behind the Scenes | Her Game, Her Voice" },
      {
        name: "description",
        content:
          "The moments between the moments. Watch the latest behind-the-scenes TikTok clips from the Her Game, Her Voice podcast.",
      },
      { property: "og:title", content: "Behind the Scenes | Her Game, Her Voice" },
      {
        property: "og:description",
        content: "The moments between the moments — the latest behind-the-scenes TikTok clips.",
      },
      { property: "og:url", content: "/behind-the-scenes" },
    ],
    links: [{ rel: "canonical", href: "/behind-the-scenes" }],
  }),
  component: BehindTheScenesPage,
});

/**
 * Extract the numeric TikTok video ID from a standard video URL, e.g.
 *   https://www.tiktok.com/@hghvpodcast/video/7311234567890123456
 * Returns null for links we can't parse (e.g. short vm.tiktok.com URLs).
 */
function getTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * ADMIN: Paste TikTok video URLs here, NEWEST FIRST.
 * Only the first three are shown on the page.
 * Use full URLs like:
 *   https://www.tiktok.com/@hghvpodcast/video/7311234567890123456
 */
const TIKTOK_VIDEO_URLS: string[] = [
  // "https://www.tiktok.com/@hghvpodcast/video/0000000000000000000",
  "https://www.tiktok.com/@hghvpodcast/video/7617891931233848598?is_from_webapp=1&sender_device=pc"
  "https://www.tiktok.com/@hghvpodcast/video/7617851906299350294?is_from_webapp=1&sender_device=pc&web_id=7647560689758275094"
  "https://www.tiktok.com/@hghvpodcast/video/7617820371462524182?is_from_webapp=1&sender_device=pc&web_id=7647560689758275094"
];

function BehindTheScenesPage() {
  const videos = TIKTOK_VIDEO_URLS.slice(0, 3)
    .map((url) => ({ url, id: getTikTokId(url) }))
    .filter((v): v is { url: string; id: string } => v.id !== null);

  return (
    <>
      <PageHero title="Behind the Scenes" subtitle="The moments between the moments">
        <p className="mt-3 max-w-xl text-white/70">
          Not everything makes the final cut… and that’s probably a good thing. Catch our latest
          clips straight from TikTok.
        </p>
      </PageHero>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {videos.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-2xl bg-card shadow-card"
                >
                  <LazyIframe
                    src={`https://www.tiktok.com/embed/v2/${video.id}`}
                    title="TikTok video"
                    height="100%"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    className="aspect-[9/16] w-full"
                  />
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-2xl bg-navy-gradient px-8 py-16 text-center text-white/70">
              <Film className="size-9" aria-hidden="true" />
              <span className="font-display text-sm font-semibold uppercase tracking-wide">
                Clips Coming Soon
              </span>
              <p className="text-sm text-white/60">
                Fresh behind-the-scenes moments are on the way.
              </p>
            </div>
          )}

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Follow{" "}
            <a
              href="https://www.tiktok.com/@hghvpodcast"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-secondary-foreground underline underline-offset-4"
            >
              @hghvpodcast
            </a>{" "}
            on TikTok for everything in between.
          </p>
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
