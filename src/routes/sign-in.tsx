import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign In — Vocalo" },
      { name: "description", content: "Sign in to save your vocal profile and recommendations." },
      { property: "og:title", content: "Sign in to Vocalo" },
      { property: "og:description", content: "Save your vocal profile and personalized song library." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      <main className="flex-1 grid place-items-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-brand blur-3xl opacity-20" />
            <div className="relative bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10">
              <div className="text-center mb-8">
                <span className="font-mono-display uppercase tracking-[0.25em] text-xs text-accent">
                  Welcome Back
                </span>
                <h1 className="text-3xl font-extrabold mt-3 mb-2">
                  Sign in to <span className="text-gradient-brand">Vocalo</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Save your vocal profile and pick up where you left off.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="space-y-2">
                  <label className="text-xs font-mono-display uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@studio.com"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono-display uppercase tracking-widest text-muted-foreground">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand hover:bg-brand/90 text-primary-foreground rounded-xl font-bold shadow-glow-brand transition-all"
                >
                  Sign In
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground font-mono-display uppercase tracking-widest">
                <div className="flex-1 h-px bg-border" />
                or
                <div className="flex-1 h-px bg-border" />
              </div>

              <button className="w-full py-3 bg-background hover:bg-white/5 border border-border rounded-xl font-semibold transition-all">
                Continue with Google
              </button>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                New to Vocalo?{" "}
                <Link to="/" className="text-accent hover:underline font-semibold">
                  Take the vocal test
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
