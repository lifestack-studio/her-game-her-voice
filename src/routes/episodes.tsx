import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Music2, Apple, Youtube, RefreshCw } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { EpisodeCard } from "@/components/episode-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { latestEpisodesQueryOptions, type Episode } from "@/lib/podcast";
import { SPOTIFY_SHOW_URL } from "@/lib/site";

export const Route = createFileRoute("/episodes")({
  head: () => ({
    meta: [
      { title: "Episodes | Her Game, Her Voice" },
      {
        name: "description",
        content:
          "Every story deserves to be heard. Stream the latest episodes of Her Game, Her Voice and subscribe wherever you listen to podcasts.",
      },
      { property: "og:title", content: "Episodes | Her Game, Her Voice" },
      {
        property: "og:description",
        content: "Every story deserves to be heard — stream the latest episodes and subscribe.",
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

function LatestEpisodes() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery(
    latestEpisodesQueryOptions,
  );
  const episodes = data ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-select the first playable episode on load.
  useEffect(() => {
    if (!activeId && episodes.length > 0) {
      const first = episodes.find((e) => e.audioUrl) ?? episodes[0];
      if (first.audioUrl) setActiveId(first.id);
    }
  }, [episodes, activeId]);

  const handlePlay = (episode: Episode) => {
    if (episode.audioUrl) setActiveId(episode.id);
  };

  const activeEpisode = episodes.find((e) => e.id === activeId) ?? null;


  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[352px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <p className="text-muted-foreground">
          We couldn’t load the latest episodes right now.
        </p>
        <Button
          type="button"
          variant="coral"
          className="mt-4"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <p className="text-muted-foreground">No episodes available right now.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,420px)]">
      <div className="space-y-4">
        {episodes.map((episode) => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            isActive={episode.id === activeId}
            onPlay={handlePlay}
          />
        ))}
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        {activeEpisode ? (
          <AudioPlayer episode={activeEpisode} />
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center rounded-2xl bg-muted text-center text-sm text-muted-foreground">
            Select an episode to start listening.
          </div>
        )}
      </div>
    </div>
  );
}

function EpisodesPage() {
  return (
    <>
      <PageHero title="Episodes" subtitle="Every story deserves to be heard" />

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Latest Episodes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Press play and meet the women rewriting the rulebook.
            </p>
          </div>
          <LatestEpisodes />
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
