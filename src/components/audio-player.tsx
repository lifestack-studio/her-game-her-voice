import { useEffect, useRef } from "react";
import { formatReleaseDate, type Episode } from "@/lib/podcast";

interface AudioPlayerProps {
  episode: Episode;
}

/**
 * Single reusable HTML5 audio player. When `episode` changes the same element
 * loads the new audio and starts playing (the change is triggered by a user
 * click on a card, so autoplay is allowed).
 */
export function AudioPlayer({ episode }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    // Best-effort autoplay; ignore promise rejection if the browser blocks it.
    void audio.play().catch(() => {});
  }, [episode.audioUrl]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-lift">
      <div className="flex gap-4">
        <img
          src={episode.image}
          alt={`Cover art for ${episode.name}`}
          width={80}
          height={80}
          className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Now playing · {formatReleaseDate(episode.releaseDate)}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-lg font-bold text-primary">
            {episode.name}
          </h3>
        </div>
      </div>
      <audio
        ref={audioRef}
        controls
        preload="none"
        className="mt-4 w-full"
        aria-label={`Audio player for ${episode.name}`}
      >
        <source src={episode.audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
