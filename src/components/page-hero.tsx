import iceTexture from "@/assets/ice-texture.jpg";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

/** Compact hero used on interior pages: ice texture under a navy overlay. */
export function PageHero({ title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-gradient">
      <img
        src={iceTexture}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1600}
        height={900}
        className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-screen"
      />
      <div className="absolute -left-16 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full border-[14px] border-accent/30 md:block" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-secondary sm:text-xl">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
