import { useEffect, useRef } from "react";
import { type Episode } from "@/lib/podcast";

interface AudioPlayerProps {
  episode: Episode;
}

/**
 * HTML5 audio player rendered inside the active episode card. It only mounts
 * after the user clicks "Play here", so starting playback here is a genuine
 * user gesture (no autostart on page load).
 */
export function AudioPlayer({ episode }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    void audio.play().catch(() => {});
  }, [episode.audioUrl]);

  return (
    <audio
      ref={audioRef}
      controls
      preload="none"
      className="mt-4 w-full"
      aria-label={`Audio player for ${episode.name}`}
    >
      <source src={episode.audioUrl} type="audio/mpeg" />
    </audio>
  );
}
