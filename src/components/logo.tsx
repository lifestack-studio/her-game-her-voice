import { Link } from "@tanstack/react-router";
import logoDark from "@/assets/logo.png";
import logoLight from "@/assets/logo-light.png";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

/** Brand wordmark logo for "Her Game, Her Voice". */
export function Logo({ className, variant = "dark" }: LogoProps) {
  const src = variant === "light" ? logoLight : logoDark;
  return (
    <Link
      to="/"
      aria-label="Her Game, Her Voice — home"
      className={`inline-flex items-center ${className ?? ""}`}
    >
      <img
        src={src}
        alt="Her Game, Her Voice"
        width={272}
        height={280}
        className="h-11 w-auto"
      />
    </Link>
  );
}
