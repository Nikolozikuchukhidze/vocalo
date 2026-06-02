import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sample-results")({
  head: () => ({
    meta: [
      { title: "Sample Results — Vocalo" },
      { name: "description", content: "See an example Vocalo profile: vocal range, classification, and matched songs." },
      { property: "og:title", content: "A Sample Vocal Profile" },
      { property: "og:description", content: "Range B2–E5, High Tenor — with matched genres and karaoke picks." },
    ],
  }),
  component: SampleResults,
});

type Song = {
  title: string;
  artist: string;
  difficulty: "EASY" | "MEDIUM" | "ADVANCED";
  match: number;
};

const songs: Song[] = [
  { title: "Perfect", artist: "Ed Sheeran", difficulty: "EASY", match: 98 },
  { title: "Someone You Loved", artist: "Lewis Capaldi", difficulty: "MEDIUM", match: 92 },
  { title: "Yellow", artist: "Coldplay", difficulty: "EASY", match: 89 },
  { title: "Gravity", artist: "John Mayer", difficulty: "ADVANCED", match: 85 },
  { title: "Stay With Me", artist: "Sam Smith", difficulty: "MEDIUM", match: 83 },
  { title: "Photograph", artist: "Ed Sheeran", difficulty: "EASY", match: 81 },
];

const difficultyStyles: Record<Song["difficulty"], string> = {
  EASY: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  ADVANCED: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

const notes = ["C2", "E2", "G2", "B2", "D3", "F3", "A3", "C4", "E4", "G4", "B4", "D5", "E5", "G5"];
const lowIdx = 3; // B2
const highIdx = 12; // E5

function SampleResults() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="mb-12">
          <span className="font-mono-display uppercase tracking-[0.3em] text-xs text-accent">
            Sample Profile
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mt-3">
            Meet a <span className="text-gradient-brand">High Tenor</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Here's what a finished Vocalo profile looks like. Yours will be tuned to your unique voice.
          </p>
        </div>

        {/* Range piano */}
        <div className="p-6 md:p-8 bg-surface/60 border border-border rounded-3xl mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest">
                Comfortable Range
              </div>
              <div className="font-display text-2xl font-bold mt-1">
                B2 <span className="text-muted-foreground">—</span> E5
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest">
                Span
              </div>
              <div className="font-display text-2xl font-bold mt-1 text-accent">2.5 oct</div>
            </div>
          </div>

          <div className="flex gap-1 h-20">
            {notes.map((n, i) => {
              const inRange = i >= lowIdx && i <= highIdx;
              return (
                <div key={n} className="flex-1 flex flex-col">
                  <div
                    className={`flex-1 rounded-t-md border-t border-x border-border ${
                      inRange ? "bg-gradient-to-b from-brand/40 to-brand/10" : "bg-white/[0.02]"
                    }`}
                  />
                  <div className={`text-[10px] font-mono-display text-center py-1 ${inRange ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {n}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile + genres */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-gradient-to-br from-brand/15 to-transparent border border-brand/30 rounded-3xl">
            <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest mb-4">
              Voice Profile
            </div>
            {[
              { label: "Warmth", value: 82 },
              { label: "Flexibility", value: 64 },
              { label: "Brightness", value: 71 },
              { label: "Resonance", value: 77 },
            ].map((m) => (
              <div key={m.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs font-mono-display mb-1.5 uppercase text-muted-foreground">
                  <span>{m.label}</span>
                  <span>{m.value}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand" style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-surface/60 border border-border rounded-3xl">
            <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest mb-4">
              Recommended Genres
            </div>
            <div className="flex flex-wrap gap-2">
              {["Pop", "Indie Pop", "Acoustic", "Soft Rock", "Country", "Folk", "Singer-Songwriter"].map((g) => (
                <span key={g} className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 bg-surface/60 border border-border rounded-3xl">
            <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest mb-4">
              Similar Artists
            </div>
            <ul className="space-y-2 text-sm">
              {["Ed Sheeran", "Sam Smith", "Lewis Capaldi", "John Mayer", "James Bay"].map((a) => (
                <li key={a} className="flex items-center justify-between">
                  <span>{a}</span>
                  <span className="text-xs text-accent font-mono-display">match</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Songs */}
        <h2 className="text-2xl font-extrabold mb-6">Karaoke Picks for Your Voice</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {songs.map((s) => (
            <div key={s.title} className="p-4 bg-surface/40 hover:bg-surface border border-border rounded-2xl flex items-center gap-4 transition-all">
              <div className="size-14 rounded-xl bg-gradient-brand shrink-0 grid place-items-center text-xl">♪</div>
              <div className="min-w-0 flex-1">
                <h5 className="font-bold truncate">{s.title}</h5>
                <p className="text-xs text-muted-foreground truncate">{s.artist}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 border rounded font-mono-display ${difficultyStyles[s.difficulty]}`}>
                    {s.difficulty}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono-display">{s.match}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/vocal-test"
            className="px-8 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all text-center"
          >
            Take Your Own Test →
          </Link>
          <Link
            to="/sign-in"
            className="px-8 py-4 bg-surface hover:bg-surface/70 border border-border rounded-2xl font-semibold transition-all text-center"
          >
            Sign In to Save Profile
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
