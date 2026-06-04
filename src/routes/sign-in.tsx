import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";

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

function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    try {
      await signInWithEmail(identifier.trim(), password);
      setStatus({ kind: "success", email: identifier });
      setTimeout(() => navigate({ to: "/sample-results" }), 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setStatus({ kind: "error", message: msg });
    }
  }

  async function handleGoogleSignIn() {
    setStatus({ kind: "loading" });
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign in failed.";
      setStatus({ kind: "error", message: msg });
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

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 bg-background hover:bg-white/5 border border-border rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    New to Vocalo?{" "}
                    <Link to="/sign-up" className="text-accent hover:underline font-semibold">
                      Create an account
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
