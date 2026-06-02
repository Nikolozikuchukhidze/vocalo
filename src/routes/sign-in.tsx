import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
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

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; email: string }
  | { kind: "error"; message: string };

// Mock validator — replace with real auth later.
function mockSignIn(email: string, password: string): Promise<{ ok: boolean; reason?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        resolve({ ok: false, reason: "That email address doesn't look right." });
      } else if (password.length < 6) {
        resolve({ ok: false, reason: "Password must be at least 6 characters." });
      } else if (password === "wrongpass") {
        resolve({ ok: false, reason: "Incorrect email or password. Try again." });
      } else {
        resolve({ ok: true });
      }
    }, 900);
  });
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    const res = await mockSignIn(email.trim(), password);
    if (res.ok) {
      setStatus({ kind: "success", email });
      setTimeout(() => navigate({ to: "/sample-results" }), 1200);
    } else {
      setStatus({ kind: "error", message: res.reason ?? "Something went wrong." });
    }
  }

  const isError = status.kind === "error";
  const isSuccess = status.kind === "success";
  const isLoading = status.kind === "loading";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      <main className="flex-1 grid place-items-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-brand blur-3xl opacity-20" />
            <div className="relative bg-surface/80 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10">
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="size-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-400/40 grid place-items-center text-3xl mb-5">
                    ✓
                  </div>
                  <h1 className="text-2xl font-extrabold mb-2">Welcome back</h1>
                  <p className="text-sm text-muted-foreground mb-1">
                    Signed in as <span className="text-foreground font-medium">{status.email}</span>
                  </p>
                  <p className="text-xs font-mono-display uppercase tracking-widest text-accent mt-4">
                    Loading your profile…
                  </p>
                </div>
              ) : (
                <>
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

                  {isError && (
                    <div
                      role="alert"
                      className="mb-5 flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm"
                    >
                      <span className="text-destructive font-bold">!</span>
                      <span className="text-destructive-foreground/90">{status.message}</span>
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={onSubmit}>
                    <div className="space-y-2">
                      <label className="text-xs font-mono-display uppercase tracking-widest text-muted-foreground">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@studio.com"
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition ${
                          isError ? "border-destructive/50 focus:ring-destructive" : "border-border focus:ring-brand"
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono-display uppercase tracking-widest text-muted-foreground">
                          Password
                        </label>
                        <button type="button" className="text-xs text-accent hover:underline">
                          Forgot?
                        </button>
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition ${
                          isError ? "border-destructive/50 focus:ring-destructive" : "border-border focus:ring-brand"
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-bold shadow-glow-brand transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        "Sign In"
                      )}
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
                    <Link to="/vocal-test" className="text-accent hover:underline font-semibold">
                      Take the vocal test
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
