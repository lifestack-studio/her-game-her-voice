import { useEffect, useRef, useState } from "react";

/* ---- Spotify iFrame API typings (minimal) ---------------------------- */
interface SpotifyController {
  loadUri: (uri: string) => void;
  destroy: () => void;
}
interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyController) => void,
  ) => void;
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    __spotifyIframeApi?: SpotifyIFrameAPI;
  }
}

const SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";
let apiPromise: Promise<SpotifyIFrameAPI> | null = null;

/** Load the Spotify iFrame API script exactly once and resolve the API object. */
function loadSpotifyApi(): Promise<SpotifyIFrameAPI> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Spotify iFrame API unavailable on server"));
  }
  if (window.__spotifyIframeApi) {
    return Promise.resolve(window.__spotifyIframeApi);
  }
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<SpotifyIFrameAPI>((resolve) => {
    window.onSpotifyIframeApiReady = (api) => {
      window.__spotifyIframeApi = api;
      resolve(api);
    };
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return apiPromise;
}

interface SpotifyPlayerProps {
  /** spotify:episode:... URI of the episode to play. */
  uri: string;
  title: string;
}

/**
 * Single reusable Spotify embed player. The controller is created once; when
 * `uri` changes the same player loads the new episode (no layout rebuild).
 */
export function SpotifyPlayer({ uri, title }: SpotifyPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const [ready, setReady] = useState(false);

  // Create the controller once.
  useEffect(() => {
    let cancelled = false;
    loadSpotifyApi().then((api) => {
      if (cancelled || !hostRef.current || controllerRef.current) return;
      api.createController(
        hostRef.current,
        { uri, width: "100%", height: "352" },
        (controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }
          controllerRef.current = controller;
          setReady(true);
        },
      );
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch episodes when the uri changes.
  useEffect(() => {
    if (ready && controllerRef.current) {
      controllerRef.current.loadUri(uri);
    }
  }, [uri, ready]);

  return (
    <div className="overflow-hidden rounded-2xl shadow-lift">
      <div ref={hostRef} title={title} aria-label={title} />
      {!ready && (
        <div className="flex h-[352px] w-full items-center justify-center bg-muted text-sm text-muted-foreground">
          Loading player…
        </div>
      )}
    </div>
  );
}
