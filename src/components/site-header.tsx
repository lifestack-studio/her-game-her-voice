import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { NAV_LINKS, SPOTIFY_SHOW_URL } from "@/lib/site";
import lifestackWhite from "@/assets/lifestack-white.png";

const LIFESTACK_URL = "https://lifestack.studio";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Presenter strip */}
      <div className="bg-accent text-white">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-2 px-4 text-xs sm:px-6">
          <span className="font-medium tracking-wide text-white/90">
            Her Game, Her Voice is brought to you by
          </span>
          <a
            href={LIFESTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="lifestack — opens in a new tab"
            className="inline-flex transition-opacity hover:opacity-80"
          >
            <img
              src={lifestackWhite}
              alt="lifestack"
              width={1328}
              height={248}
              className="h-3.5 w-auto"
            />
          </a>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-md shadow-sm"
            : "bg-background/40 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />


        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-accent data-[status=active]:text-accent data-[status=active]:font-semibold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button asChild variant="coral" className="hidden sm:inline-flex">
            <a href={SPOTIFY_SHOW_URL} target="_blank" rel="noopener noreferrer">
              Listen Now
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-navy-gradient text-white border-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="mt-2 mb-8">
                <Logo variant="light" />
              </div>
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <SheetClose asChild>
                      <Link
                        to={link.to}
                        activeOptions={{ exact: link.to === "/" }}
                        className="block rounded-md px-3 py-3 text-lg font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white data-[status=active]:text-blush"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <Button asChild variant="onDark" size="lg" className="mt-8 w-full">
                <a href={SPOTIFY_SHOW_URL} target="_blank" rel="noopener noreferrer">
                  Listen Now
                </a>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </nav>
    </header>
  );
}

