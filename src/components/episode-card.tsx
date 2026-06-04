import { ExternalLink, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatReleaseDate, type Episode } from "@/lib/podcast";

interface EpisodeCardProps {
  episode: Episode;
  isActive: boolean;
  onPlay: (episode: Episode) => void;
}

export function EpisodeCard({ episode, isActive, onPlay }: EpisodeCardProps) {
  return (
    <article
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex gap-4 rounded-2xl border bg-card p-4 shadow-card transition-colors",
        isActive
          ? "border-primary ring-2 ring-primary/40"
          : "border-border hover:border-primary/40",
      )}
    >
      <img
        src={episode.image}
        alt={`Cover art for ${episode.name}`}
        width={96}
        height={96}
        loading="lazy"
        className="h-20 w-20 flex-shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatReleaseDate(episode.releaseDate)}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold text-primary">
          {episode.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {episode.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={isActive ? "teal" : "coral"}
            size="sm"
            onClick={() => onPlay(episode)}
            aria-label={
              isActive ? `${episode.name} is playing` : `Play ${episode.name} here`
            }
            aria-pressed={isActive}
          >
            {isActive ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {isActive ? "Playing" : "Play here"}
          </Button>
          <a
            href={episode.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-semibold text-accent transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Listen on Spotify
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
