import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import heroImg from "@/assets/hero-visualizer.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vocalo — Discover What Music Fits Your Voice" },
      { name: "description", content: "Record your voice. Vocalo analyzes your vocal range and recommends genres, artists, and karaoke songs made for you." },
      { property: "og:title", content: "Vocalo — Discover What Music Fits Your Voice" },
      { property: "og:description", content: "Personalized music and karaoke recommendations based on your real vocal range." },
    ],
  }),
  component: Index,
});

type Song = {
  title: string;
  artist: string;
  difficulty: "EASY" | "MEDIUM" | "ADVANCED";
  match: number;
  tone: "brand" | "secondary" | "accent";
};

const songs: Song[] = [
  { title: "Perfect", artist: "Ed Sheeran", difficulty: "EASY", match: 98, tone: "accent" },
  { title: "Someone You Loved", artist: "Lewis Capaldi", difficulty: "MEDIUM", match: 92, tone: "secondary" },
  { title: "Yellow", artist: "Coldplay", difficulty: "EASY", match: 89, tone: "accent" },
  { title: "Gravity", artist: "John Mayer", difficulty: "ADVANCED", match: 85, tone: "brand" },
];

const difficultyStyles: Record<Song["difficulty"], string> = {
  EASY: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  ADVANCED: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

function Index() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-bold tracking-widest uppercase font-mono-display">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              AI Voice Analysis
            </div>
            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl leading-[1.05] font-extrabold">
              Discover What{" "}
              <span className="text-gradient-brand">Music Fits</span> Your Voice.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Analyze your comfortable vocal range and get personalized genre,
              artist, and karaoke recommendations in seconds.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all flex items-center gap-3">
                Start Vocal Test
                <span className="text-xl">→</span>
              </button>
              <button className="px-8 py-4 bg-surface hover:bg-surface/70 text-foreground rounded-2xl font-bold transition-all border border-border">
                View Sample Results
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-brand blur-3xl opacity-30" />
            <div className="relative w-full aspect-square rounded-3xl border border-border overflow-hidden backdrop-blur-xl">
              <img
                src={heroImg}
                alt="Neon soundwave visualization around a studio microphone"
                width={1024}
                height={1024}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Vocal Intelligence */}
      <section className="bg-surface/30 border-y border-border py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-extrabold mb-4">Vocal Intelligence</h2>
              <p className="text-muted-foreground">
                Our engine measures over 12 parameters of your singing profile.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-background/60 rounded-xl border border-border">
                <div className="text-[10px] uppercase font-mono-display text-muted-foreground mb-1">Current Range</div>
                <div className="font-mono-display text-accent text-lg">B2 — E5</div>
              </div>
              <div className="px-4 py-2 bg-background/60 rounded-xl border border-border">
                <div className="text-[10px] uppercase font-mono-display text-muted-foreground mb-1">Classification</div>
                <div className="font-mono-display text-brand-secondary text-lg">Baritone</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🎤", title: "Record Comfort Notes", desc: "Hum your lowest and highest comfortable notes to map your tessitura.", color: "brand" },
              { icon: "⚡", title: "AI Analysis", desc: "Instant detection of vocal weight, brightness, and natural resonance.", color: "brand-secondary" },
              { icon: "🎸", title: "Matching Engine", desc: "Get songs tagged with the exact difficulty and range suitability for you.", color: "brand-accent" },
            ].map((c) => (
              <div
                key={c.title}
                className="p-8 bg-surface border border-border rounded-3xl space-y-4 hover:border-brand/40 transition-colors group"
              >
                <div
                  className="size-12 rounded-2xl grid place-items-center text-2xl group-hover:scale-110 transition-transform"
                  style={{ background: `color-mix(in oklab, var(--${c.color}) 20%, transparent)` }}
                >
                  {c.icon}
                </div>
                <h3 className="text-xl font-bold">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Mock */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Profile Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <div className="p-6 bg-gradient-to-br from-brand/15 to-transparent border border-brand/30 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-16 rounded-full bg-gradient-brand border-2 border-brand grid place-items-center text-2xl">
                  🎙️
                </div>
                <div>
                  <h4 className="font-bold text-xl">Your Profile</h4>
                  <span className="text-xs text-brand font-mono-display uppercase tracking-widest">
                    High Tenor
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Warmth", value: 82, color: "var(--brand)" },
                  { label: "Flexibility", value: 64, color: "var(--brand-secondary)" },
                  { label: "Brightness", value: 71, color: "var(--brand-accent)" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs font-mono-display mb-2 uppercase text-muted-foreground">
                      <span>{m.label}</span>
                      <span>{m.value}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${m.value}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-surface border border-border rounded-3xl">
              <div className="text-xs font-mono-display uppercase text-muted-foreground mb-4">
                Recommended Genres
              </div>
              <div className="flex flex-wrap gap-2">
                {["Pop", "Indie Pop", "Acoustic", "Soft Rock", "Country"].map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Songs */}
          <div className="lg:w-2/3">
            <h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3">
              Perfect Match Songs
              <span className="px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent text-[10px] rounded uppercase tracking-tighter font-mono-display">
                Top Picks
              </span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {songs.map((s) => (
                <div
                  key={s.title}
                  className="flex items-center p-4 bg-surface/40 hover:bg-surface border border-border rounded-2xl gap-4 transition-all group"
                >
                  <div className="size-16 rounded-xl bg-gradient-brand shrink-0 group-hover:scale-105 transition-transform grid place-items-center text-2xl">
                    ♪
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold truncate">{s.title}</h5>
                    <p className="text-xs text-muted-foreground truncate">{s.artist}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 border rounded font-mono-display ${difficultyStyles[s.difficulty]}`}
                      >
                        {s.difficulty}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono-display">
                        {s.match}% Match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/how-it-works"
                className="text-sm text-accent hover:underline font-mono-display uppercase tracking-widest"
              >
                Learn how this works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
