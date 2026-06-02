import { Link } from "@tanstack/react-router";
import { VocaloLogo } from "./VocaloLogo";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function SiteNav() {
  const { user, isLoading } = useAuth();

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "User";

  const firstLetter = (displayName as string)?.charAt(0).toUpperCase() || "U";

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
        <Link
          to="/train"
          className="hover:text-foreground transition-colors"
          activeProps={{ className: "text-foreground" }}
        >
          Train
        </Link>
      </div>

      {isLoading ? (
        <div className="w-20 h-10 bg-white/5 rounded-full animate-pulse" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-semibold transition-all border border-border">
              <div className="size-7 rounded-full bg-brand/20 border border-brand/40 grid place-items-center text-xs font-bold text-brand">
                {firstLetter}
              </div>
              <span className="hidden sm:inline text-foreground">{displayName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <DropdownMenuItem
              asChild
              className="cursor-pointer"
            >
              <Link to="/sample-results" className="flex items-center gap-2">
                <User className="size-4" />
                My Results
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await signOut();
                } catch {
                  // ignore
                }
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/sign-in"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-sm font-semibold transition-all border border-border"
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
}
