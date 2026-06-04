import { useEffect, useRef, useState } from "react";

interface LazyIframeProps {
  src: string;
  title: string;
  className?: string;
  height?: number | string;
  allow?: string;
  /** shown before the iframe scrolls into view */
  placeholderClassName?: string;
}

/**
 * Renders an iframe only once it scrolls into view, to keep initial load light.
 */
export function LazyIframe({
  src,
  title,
  className,
  height = 400,
  allow,
  placeholderClassName,
}: LazyIframeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={className} style={{ height }}>
      {visible ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow={allow}
          className="h-full w-full rounded-xl border-0"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div
          className={
            placeholderClassName ??
            "flex h-full w-full animate-pulse items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground"
          }
          aria-hidden="true"
        >
          Loading {title}…
        </div>
      )}
    </div>
  );
}
