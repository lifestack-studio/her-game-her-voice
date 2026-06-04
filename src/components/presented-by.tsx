import { Button } from "@/components/ui/button";
import lifestackColour from "@/assets/lifestack-colour.png";

const LIFESTACK_URL = "https://lifestack.studio";

/**
 * lifestack presenter zone — shown near the footer.
 * Light surface with the colour lifestack mark (brand rule: colour mark on
 * light, white mark on dark). Teal is the lifestack presence colour.
 */
export function PresentedBy() {
  return (
    <section aria-labelledby="presented-by-heading" className="bg-blush/60">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Presented by
        </p>
        <a
          href={LIFESTACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="lifestack — opens in a new tab"
          className="inline-flex transition-opacity hover:opacity-80"
        >
          <img
            src={lifestackColour}
            alt="lifestack"
            width={1328}
            height={248}
            loading="lazy"
            className="h-10 w-auto sm:h-12"
          />
        </a>
        <h2
          id="presented-by-heading"
          className="font-display text-2xl font-semibold text-primary sm:text-3xl"
        >
          Her Game, Her Voice is brought to you by{" "}
          <span className="font-sans font-semibold">lifestack</span>
        </h2>
        <p className="max-w-xl text-foreground/80">
          Optimise your game, on and off the ice — a word from our presenting partner.
        </p>
        <Button asChild variant="teal" size="lg">
          <a href={LIFESTACK_URL} target="_blank" rel="noopener noreferrer">
            Discover lifestack
          </a>
        </Button>
      </div>
    </section>
  );
}
