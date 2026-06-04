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
      <audio
        ref={audioRef}
        controls
        preload="none"
        className="w-full"
        aria-label={`Audio player for ${episode.name}`}
      >
        <source src={episode.audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
