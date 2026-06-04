import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import brandBanner from "@/assets/brand-banner.png.asset.json";
import gameAction from "@/assets/game-action.webp.asset.json";
import jerseyDisplay from "@/assets/jersey-display.jpg.asset.json";
import merchDisplay from "@/assets/merch-display.jpg.asset.json";
import recordingJersey from "@/assets/recording-jersey.jpg.asset.json";
import pinkStudio from "@/assets/pink-studio.jpg.asset.json";
import studioMic from "@/assets/studio-mic.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { LazyIframe } from "@/components/lazy-iframe";
import { PhotoGallery } from "@/components/photo-gallery";
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
          src={heroImg}
          alt="Women's ice hockey players in action on the rink"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
              Her Game,
              <br />
              <span className="text-accent">Her Voice</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-secondary sm:text-2xl">
              Women changing the face of ice hockey, one story at a time.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="coral" size="xl">
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
      <section className="bg-[#f4dce9]">
        <img
          src={brandBanner.url}
          alt="Her Game, Her Voice — Leading the conversation in Womens Ice Hockey"
          width={1900}
          height={628}
          loading="lazy"
          className="mx-auto h-auto w-full max-w-[1900px]"
        />
      </section>

      {/* Mission statement */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-lg leading-relaxed text-foreground sm:text-xl">
            Her Game, Her Voice is a podcast celebrating the women who are reshaping ice
            hockey. Each episode features honest, in-person conversations with team captains,
            players, and changemakers from across the UK.
          </p>
          <blockquote className="mx-auto mt-12 max-w-2xl border-l-4 border-accent bg-muted/50 px-6 py-6 text-left">
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
          <Button asChild variant="coral" size="lg">
            <Link to="/contact">Sponsorship Enquiries</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
