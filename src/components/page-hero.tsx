interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

/** Compact hero used on interior pages: clean plum → teal brand gradient band. */
export function PageHero({ title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <div className="pointer-events-none absolute -left-16 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full border-[14px] border-white/10 md:block" />
      <div className="pointer-events-none absolute -right-20 -top-16 hidden h-56 w-56 rounded-full border-[14px] border-teal/30 md:block" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
