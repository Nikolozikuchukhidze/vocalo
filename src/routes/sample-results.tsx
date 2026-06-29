import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { getRecommendations, type Recommendations } from "@/lib/recommend.functions";

type SearchParams = {
  low?: string;
  high?: string;
  lowF?: number;
  highF?: number;
};

export const Route = createFileRoute("/sample-results")({
  head: () => ({
    meta: [
      { title: "Your Results — Vocalo" },
      { name: "description", content: "AI-recommended genres and artists based on your vocal range." },
      { property: "og:title", content: "Your Vocal Profile" },
      { property: "og:description", content: "Genres and artists matched to your range by Vocalo AI." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    low: typeof search.low === "string" ? search.low : undefined,
    high: typeof search.high === "string" ? search.high : undefined,
    lowF: search.lowF !== undefined ? Number(search.lowF) : undefined,
    highF: search.highF !== undefined ? Number(search.highF) : undefined,
  }),
  component: SampleResults,
});

const PIANO_NOTES = ["C2", "E2", "G2", "B2", "D3", "F3", "A3", "C4", "E4", "G4", "B4", "D5", "E5", "G5", "B5"];

function noteToMidi(note: string): number | null {
  const m = note.match(/^([A-G])(#|b)?(-?\d+)$/);
  if (!m) return null;
  const names: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let n = names[m[1]];
  if (m[2] === "#") n += 1;
  if (m[2] === "b") n -= 1;
  return n + (parseInt(m[3], 10) + 1) * 12;
}

function pianoIndexFor(note: string): number {
  const midi = noteToMidi(note);
  if (midi == null) return -1;
  let best = 0;
  let bestDiff = Infinity;
  PIANO_NOTES.forEach((n, i) => {
    const m = noteToMidi(n);
    if (m == null) return;
    const diff = Math.abs(m - midi);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

function SampleResults() {
  const search = Route.useSearch();
  const hasData = !!(search.low && search.high);

  const fetchRecs = useServerFn(getRecommendations);
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasData) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRecs({
      data: {
        lowNote: search.low!,
        highNote: search.high!,
        lowFreq: search.lowF ?? 0,
        highFreq: search.highF ?? 0,
      },
    })
      .then((r) => {
        if (!cancelled) setRecs(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load recommendations");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hasData, search.low, search.high, search.lowF, search.highF, fetchRecs]);

  const displayLow = search.low ?? "B2";
  const displayHigh = search.high ?? "E5";
  const lowIdx = pianoIndexFor(displayLow);
  const highIdx = pianoIndexFor(displayHigh);

  const voiceType = recs?.voiceType ?? (hasData ? "Analyzing…" : "High Tenor");
  const span = recs?.span ?? (hasData ? "" : "2.5 oct");
  const summary = recs?.summary ?? "";

  const genres = recs?.genres ?? (hasData ? [] : ["Pop", "Indie Pop", "Acoustic", "Soft Rock", "Country", "Folk", "Singer-Songwriter"]);
  const artists = recs?.artists ?? (hasData ? [] : ["Ed Sheeran", "Sam Smith", "Lewis Capaldi", "John Mayer", "James Bay"].map((name) => ({ name, reason: "" })));

  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
        <div className="mb-12">
          <span className="font-mono-display uppercase tracking-[0.3em] text-xs text-accent">
            {hasData ? "Your Profile" : "Sample Profile"}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mt-3">
            {hasData ? "You're a " : "Meet a "}
            <span className="text-gradient-brand">{voiceType}</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            {loading
              ? "Vocalo AI is analyzing your range and matching it to genres and artists…"
              : summary || (hasData
                ? "Recommendations powered by Vocalo AI, based on your recorded range."
                : "Here's what a finished Vocalo profile looks like. Yours will be tuned to your unique voice.")}
          </p>
          {error && (
            <div className="mt-4 p-4 border border-destructive/40 bg-destructive/10 rounded-2xl text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Range piano */}
        <div className="p-6 md:p-8 bg-surface/60 border border-border rounded-3xl mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest">
                Comfortable Range
              </div>
              <div className="font-display text-2xl font-bold mt-1">
                {displayLow} <span className="text-muted-foreground">—</span> {displayHigh}
              </div>
            </div>
            {span && (
              <div className="text-right">
                <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest">
                  Span
                </div>
                <div className="font-display text-2xl font-bold mt-1 text-accent">{span}</div>
              </div>
            )}
          </div>

          <div className="flex gap-1 h-20">
            {PIANO_NOTES.map((n, i) => {
              const inRange = lowIdx >= 0 && highIdx >= 0 && i >= lowIdx && i <= highIdx;
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

        {/* Genres + artists */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-surface/60 border border-border rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest">
                Recommended Genres
              </div>
              {loading && <span className="text-[10px] font-mono-display text-accent animate-pulse">AI working…</span>}
            </div>
            {genres.length === 0 && loading ? (
              <SkeletonChips />
            ) : (
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span key={g} className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-surface/60 border border-border rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono-display uppercase text-muted-foreground tracking-widest">
                Matched Artists
              </div>
              {loading && <span className="text-[10px] font-mono-display text-accent animate-pulse">AI working…</span>}
            </div>
            {artists.length === 0 && loading ? (
              <SkeletonList />
            ) : (
              <ul className="space-y-3 text-sm">
                {artists.map((a) => (
                  <li key={a.name} className="border-b border-border last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{a.name}</span>
                      <span className="text-xs text-accent font-mono-display">match</span>
                    </div>
                    {a.reason && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.reason}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/vocal-test"
            className="px-8 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all text-center"
          >
            {hasData ? "Retake Test" : "Take Your Own Test"} →
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

function SkeletonChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className="h-6 w-20 rounded-full bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}
