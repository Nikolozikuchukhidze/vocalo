import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/vocal-test")({
  head: () => ({
    meta: [
      { title: "Vocal Test — Vocalo" },
      { name: "description", content: "Calibrate your vocal range in under a minute with our guided recording test." },
      { property: "og:title", content: "Take Your Vocal Test" },
      { property: "og:description", content: "Hum your lowest and highest notes — Vocalo handles the rest." },
    ],
  }),
  component: VocalTest,
});

type Phase = "intro" | "low" | "high" | "analyzing" | "done";

const phaseCopy: Record<Phase, { title: string; sub: string; note: string }> = {
  intro: {
    title: "Ready to find your range?",
    sub: "We'll capture your lowest and highest comfortable notes. Total time: about 45 seconds.",
    note: "Use headphones in a quiet room for best accuracy.",
  },
  low: {
    title: "Hum your lowest comfortable note",
    sub: "Hold the note steady for 4 seconds. Don't strain — comfort matters more than depth.",
    note: "Recording…",
  },
  high: {
    title: "Now your highest comfortable note",
    sub: "Slide up into the note and hold for 4 seconds. Stop if it feels tight.",
    note: "Recording…",
  },
  analyzing: {
    title: "Mapping your tessitura",
    sub: "Detecting weight, brightness, and natural resonance.",
    note: "This usually takes 3–5 seconds.",
  },
  done: {
    title: "Your profile is ready",
    sub: "We matched your voice to genres, artists, and karaoke songs that fit your natural range.",
    note: "B2 — E5 · High Tenor",
  },
};

function VocalTest() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (phase === "intro" || phase === "done") return;
    setProgress(0);
    const start = Date.now();
    const total = phase === "analyzing" ? 3500 : 4500;
    const id = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / total) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        setPhase((p) => (p === "low" ? "high" : p === "high" ? "analyzing" : "done"));
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [phase]);

  const copy = phaseCopy[phase];
  const recording = phase === "low" || phase === "high";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      <main className="flex-1 grid place-items-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-brand blur-3xl opacity-20" />
            <div className="relative bg-surface/70 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-12 text-center">
              <span className="font-mono-display uppercase tracking-[0.3em] text-xs text-accent">
                Step {phase === "intro" ? "0" : phase === "low" ? "1" : phase === "high" ? "2" : "3"} of 3
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-4 mb-3">
                {copy.title}
              </h1>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto">{copy.sub}</p>

              {/* Mic visualizer */}
              <div className="relative grid place-items-center mb-10 h-56">
                {recording && (
                  <>
                    <div className="absolute size-44 rounded-full border border-brand/30" style={{ animation: "pulse-ring 1.5s ease-out infinite" }} />
                    <div className="absolute size-56 rounded-full border border-brand/20" style={{ animation: "pulse-ring 1.5s ease-out 0.4s infinite" }} />
                  </>
                )}
                <button
                  type="button"
                  disabled={phase === "analyzing"}
                  onClick={() => {
                    if (phase === "intro") setPhase("low");
                    if (phase === "done") navigate({ to: "/sample-results" });
                  }}
                  className={`relative size-32 rounded-full grid place-items-center text-5xl transition-all ${
                    recording
                      ? "bg-destructive mic-pulse"
                      : phase === "analyzing"
                        ? "bg-surface border border-border"
                        : "bg-gradient-brand shadow-glow-brand hover:scale-105"
                  }`}
                >
                  {phase === "analyzing" ? (
                    <span className="size-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : phase === "done" ? (
                    "✓"
                  ) : (
                    "🎙️"
                  )}
                </button>
              </div>

              {/* Progress */}
              {(recording || phase === "analyzing") && (
                <div className="mb-6">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-brand transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs font-mono-display uppercase tracking-widest text-muted-foreground mb-8">
                {copy.note}
              </p>

              {phase === "intro" && (
                <button
                  onClick={() => setPhase("low")}
                  className="w-full sm:w-auto px-10 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all"
                >
                  Start Recording
                </button>
              )}

              {phase === "done" && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/sample-results"
                    className="px-8 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all"
                  >
                    See My Results →
                  </Link>
                  <button
                    onClick={() => setPhase("intro")}
                    className="px-8 py-4 bg-surface hover:bg-surface/70 border border-border rounded-2xl font-semibold transition-all"
                  >
                    Retake Test
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By recording, you agree to Vocalo's voice processing. Audio is analyzed on-device and never stored.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
