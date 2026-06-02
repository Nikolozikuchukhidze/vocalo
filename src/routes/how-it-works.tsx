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
