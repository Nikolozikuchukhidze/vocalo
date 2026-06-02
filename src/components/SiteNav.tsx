import { Link } from "@tanstack/react-router";
import { VocaloLogo } from "./VocaloLogo";

export function SiteNav() {
  return (
    <nav className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-border">
      <VocaloLogo />
      <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
        <Link
          to="/how-it-works"
          className="hover:text-foreground transition-colors"
          activeProps={{ className: "text-foreground" }}
        >
          How it Works
        </Link>
      </div>
      <Link
        to="/sign-in"
        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-sm font-semibold transition-all border border-border"
      >
        Sign In
      </Link>
    </nav>
  );
}
