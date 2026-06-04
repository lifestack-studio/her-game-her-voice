import { Link } from "@tanstack/react-router";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

/**
 * Wordmark logo. Replace with uploaded image asset when available:
 * import logo from "@/assets/logo.png"; <img src={logo} ... />
 */
export function Logo({ className, variant = "dark" }: LogoProps) {
  const text = variant === "light" ? "text-white" : "text-primary";
  return (
    <Link
      to="/"
      aria-label="Her Game, Her Voice — home"
      className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-display text-lg font-bold leading-none shadow-sm">
        H
      </span>
      <span className={`font-display text-lg font-bold leading-tight tracking-tight ${text}`}>
        Her Game,
        <span className="text-accent"> Her Voice</span>
      </span>
    </Link>
  );
}
