import { Link } from "@tanstack/react-router";

export function VocaloLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center shadow-glow-brand">
        <div className="size-3.5 bg-background rounded-sm" />
      </div>
      <span className="font-display font-extrabold text-xl tracking-tight uppercase italic">
        Vocalo
      </span>
    </Link>
  );
}
