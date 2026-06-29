import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it Works — Vocalo" },
      { name: "description", content: "Three steps to discover the music made for your voice: calibrate, analyze, match." },
      { property: "og:title", content: "How Vocalo Works" },
      { property: "og:description", content: "Calibrate your range, get analyzed, and match with songs that fit your voice." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    n: "01",
    title: "Calibrate",
    desc: "Hum your lowest and highest comfortable notes. We map your unique vocal geometry in under a minute — no perfect singing required.",
    accent: "var(--brand)",
  },
  {
    n: "02",
    title: "Analyze",
    desc: "Our neural engine measures over 12 parameters — weight, brightness, flexibility, resonance — to classify your voice type.",
    accent: "var(--brand-secondary)",
  },
  {
    n: "03",
    title: "Match",
    desc: "Browse thousands of songs and artists ranked by how perfectly they sit inside your natural tessitura.",
    accent: "var(--brand-accent)",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="max-w-5xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center mb-20">
          <span className="font-mono-display uppercase tracking-[0.3em] text-xs text-accent">
            Behind the Sound
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold mt-4 mb-6">
            How <span className="text-gradient-brand">Vocalo</span> Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From microphone to recommendation, here's exactly what happens to your voice.
          </p>
        </div>

        {/* Mascot coach */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4">
          {/* Mascot card */}
          <div className="relative size-32 sm:size-36 rounded-3xl border-2 border-brand bg-surface/80 grid place-items-center shadow-glow-brand shrink-0">
            <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
              <circle cx="28" cy="32" r="5" fill="var(--brand)" />
              <circle cx="52" cy="32" r="5" fill="var(--brand)" />
              <path
                d="M24 48 Q24 58 40 58 Q56 58 56 48"
                stroke="var(--brand)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute -top-3 -right-3 text-brand-accent text-xl font-mono-display">~</span>
            <span className="absolute -bottom-2 -right-2 text-brand-secondary text-xs font-mono-display">▪▪</span>
          </div>

          {/* Speech bubble */}
          <div className="relative max-w-sm">
            {/* Tail */}
            <div className="hidden sm:block absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[12px] border-y-transparent border-r-[14px] border-r-brand" />
            <div className="hidden sm:block absolute left-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-surface" />
            <div className="px-8 py-6 rounded-3xl border-2 border-brand bg-surface/80 text-center">
              <p className="font-display text-lg sm:text-xl text-brand font-bold leading-snug">
                "Hold the note higher!
                <br />
                <span className="font-mono-display tracking-wide">BIP-BOP!</span>"
              </p>
            </div>
            <span className="absolute -top-3 -right-3 text-brand-accent text-xl font-mono-display">~</span>
          </div>
        </div>



        <div className="space-y-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="p-8 md:p-10 bg-surface/60 border border-border rounded-3xl flex flex-col md:flex-row md:items-start gap-8"
            >
              <div
                className="font-mono-display text-5xl font-bold shrink-0"
                style={{ color: s.accent }}
              >
                {s.n}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/vocal-test"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all"
          >
            Start Vocal Test
            <span className="text-xl">→</span>
          </Link>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
