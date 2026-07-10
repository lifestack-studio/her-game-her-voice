import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { SHOP_URL } from "@/lib/site";
import { JERSEYS } from "@/lib/jerseys";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop | Her Game, Her Voice" },
      {
        name: "description",
        content:
          "Rep the game. Shop limited edition Her Game, Her Voice ice hockey jerseys and merchandise designed and manufactured by Rhino Direct.",
      },
      { property: "og:title", content: "Shop | Her Game, Her Voice" },
      {
        property: "og:description",
        content: "Rep the game — limited edition jerseys and merch.",
      },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

const jerseys = JERSEYS;


function ShopPage() {
  return (
    <>
      <PageHero title="Shop" subtitle="Rep the game" />

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Limited Edition Jerseys
            </h2>
            <p className="mt-3 text-muted-foreground">
              Designed and manufactured by{" "}
              <a
                href="https://rhino.direct/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                Rhino Direct
              </a>
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {jerseys.map((jersey) => (
              <article
                key={jersey.slug}
                className="group overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:-translate-y-1.5 hover:shadow-lift"
              >
                <Link to="/shop/$slug" params={{ slug: jersey.slug }} className="block">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={jersey.image}
                      alt={`${jersey.name} — Her Game, Her Voice`}
                      width={1024}
                      height={1024}
                      loading="lazy"
                      className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="flex items-center justify-between gap-3 p-5">
                  <h3 className="font-display text-lg font-bold text-primary">{jersey.name}</h3>
                  <Button asChild variant="coral" size="sm">
                    <Link to="/shop/$slug" params={{ slug: jersey.slug }}>
                      Buy Now
                    </Link>
                  </Button>
                </div>
              </article>
            ))}

          </div>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">More Merch</h2>
          <p className="max-w-2xl text-lg text-primary/80">
            Browse our full range of merchandise including hoodies, caps, and accessories.
          </p>
          <Button asChild variant="coral" size="xl">
            <a href={SHOP_URL} target="_blank" rel="noopener noreferrer">
              Visit Our Shop
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
