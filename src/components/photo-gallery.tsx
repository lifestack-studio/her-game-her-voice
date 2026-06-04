interface GalleryPhoto {
  src: string;
  alt: string;
  /** When true, the photo spans two rows for a more dynamic layout. */
  tall?: boolean;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  className?: string;
}

/** Responsive behind-the-scenes photo grid with subtle hover motion. */
export function PhotoGallery({ photos, className }: PhotoGalleryProps) {
  return (
    <div
      className={`grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 md:grid-cols-3 ${
        className ?? ""
      }`}
    >
      {photos.map((photo) => (
        <figure
          key={photo.src}
          className={`group relative overflow-hidden rounded-2xl bg-muted shadow-card ${
            photo.tall ? "row-span-2" : ""
          }`}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </figure>
      ))}
    </div>
  );
}
