import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Quote, Youtube } from "lucide-react";
import heroAsset from "@/assets/hero.jpg.asset.json";
import brandBanner from "@/assets/brand-banner.png";
import textBackground from "@/assets/text-background.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { PresentedBy } from "@/components/presented-by";
import { LazyIframe } from "@/components/lazy-iframe";
import { SPOTIFY_SHOW_URL, SPOTIFY_EMBED_URL } from "@/lib/site";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Her Game, Her Voice | Women in Ice Hockey Podcast" },
      {
        name: "description",
        content:
          "Women changing the face of ice hockey, one story at a time. Listen to honest conversations with players, captains and changemakers across the UK.",
      },
      { property: "og:title", content: "Her Game, Her Voice | Women in Ice Hockey Podcast" },
      {
        property: "og:description",
        content:
          "Women changing the face of ice hockey, one story at a time. Hosted by Emma Stigter.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});



function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden md:min-h-[80vh]">
        <img
          src={heroAsset.url}
          alt="Women's ice hockey players in action on the rink"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover object-center"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
              Her Game,
              <br />
              <span className="text-blush">Her Voice</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-secondary sm:text-2xl">
              Women changing the face of ice hockey, one story at a time.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="teal" size="xl">

                <a href={SPOTIFY_SHOW_URL} target="_blank" rel="noopener noreferrer">
                  Listen on Spotify
                </a>
              </Button>
              <Button asChild variant="heroOutline" size="xl">
                <Link to="/contact">Become a Guest</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand banner strip */}
      <section className="bg-blush">
        <img
          src={brandBanner}
          alt="Her Game, Her Voice — Leading the conversation in Womens Ice Hockey"
          width={1900}
          height={628}
          loading="lazy"
          className="mx-auto h-auto w-full max-w-[1900px]"
        />
      </section>

      {/* Mission statement */}
      <section
        className="relative bg-cover bg-center py-20 sm:py-28"
        style={{ backgroundImage: `url(${textBackground.url})` }}
      >
        <div className="absolute inset-0 bg-primary/30" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="rounded-xl bg-background/80 px-6 py-10 shadow-lg backdrop-blur-sm sm:px-10">
            <p className="text-lg leading-relaxed text-foreground sm:text-xl">
              Her Game, Her Voice is a podcast celebrating the women who are reshaping ice
              hockey. Each episode features honest, in-person conversations with team captains,
              players, and changemakers from across the UK.
            </p>
          </div>
        </div>
      </section>

      {/* Founder quote */}
      <section className="bg-secondary/20 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <blockquote className="mx-auto max-w-2xl border-l-4 border-accent bg-background px-6 py-6 text-left shadow-lg">
            <Quote className="mb-3 size-7 text-accent" aria-hidden="true" />
            <p className="font-display text-2xl font-medium italic leading-snug text-primary sm:text-3xl">
              “I got sick of being told I couldn’t play hockey because I was a girl.”
            </p>
            <footer className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              — Emma Stigter, Founder
            </footer>
          </blockquote>
        </div>
      </section>

      {/* YouTube banner */}
      <section className="bg-brand-gradient">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <div className="flex items-center gap-4">
            <Youtube className="size-10 text-white" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                We are on YouTube Now
              </h2>
              <p className="mt-1 text-white/80">
                Watch the latest episodes and clips from the show.
              </p>
            </div>
          </div>
          <Button asChild variant="onDark" size="lg">
            <Link to="/episodes">Watch now</Link>
          </Button>
        </div>
      </section>

      {/* Latest episodes */}
      <section className="bg-secondary/20 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-primary sm:text-4xl">
            Latest Episodes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Press play and meet the women rewriting the rulebook.
          </p>
          <div className="mx-auto mt-10 max-w-[800px]">
            <LazyIframe
              src={SPOTIFY_EMBED_URL}
              title="Her Game, Her Voice on Spotify"
              height={400}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="overflow-hidden rounded-xl shadow-card"
            />
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/episodes"
              className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
            >
              See All Episodes <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Guest nomination banner */}
      <section className="bg-secondary">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Know someone who should be on the show?
          </h2>
          <p className="max-w-2xl text-lg text-primary/80">
            We’re always looking for inspiring women in hockey to feature.
          </p>
          <Button asChild variant="coral" size="lg">
            <Link to="/contact">Nominate a Guest</Link>
          </Button>
        </div>
      </section>

      {/* Presenting partner */}
      <PresentedBy />

      {/* Sponsors */}
      <section className="bg-navy-gradient">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Partner With Us
          </h2>
          <p className="max-w-2xl text-lg text-white/75">
            Interested in sponsoring the podcast or collaborating on events? We’d love to hear
            from you.
          </p>
          <Button asChild variant="onDark" size="lg">
            <Link to="/contact">Sponsorship Enquiries</Link>
          </Button>
        </div>
      </section>

    </>
  );
}
