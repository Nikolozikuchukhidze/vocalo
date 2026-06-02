import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/train")({
  head: () => ({
    meta: [
      { title: "Train — Vocalo" },
      { name: "description", content: "Live key detection while you sing. Vocalo listens and tells you exactly what note and key you're in — then guides you to the next one." },
      { property: "og:title", content: "Live Singing Trainer" },
      { property: "og:description", content: "Real-time pitch and key detection with guided target notes." },
    ],
  }),
  component: TrainPage,
});

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

function freqToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function midiToNote(midi: number): { name: string; octave: number; cents: number } {
  const rounded = Math.round(midi);
  const cents = Math.round((midi - rounded) * 100);
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return { name, octave, cents };
}

function detectPitch(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

  const trimmed = buf.slice(r1, r2);
  const T = trimmed.length;
  const c = new Array(T).fill(0);
  for (let i = 0; i < T; i++) for (let j = 0; j < T - i; j++) c[i] += trimmed[j] * trimmed[j + i];

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < T; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  let T0 = maxpos;
  if (T0 <= 0) return -1;

  const x1 = c[T0 - 1] ?? 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  const freq = sampleRate / T0;
  if (freq < 60 || freq > 1200) return -1;
  return freq;
}

// Guess key from a buffer of recently sung pitch classes
function guessKey(pcHistogram: number[]): { tonic: number; mode: "major" | "minor"; confidence: number } | null {
  const total = pcHistogram.reduce((a, b) => a + b, 0);
  if (total < 8) return null;
  let best = { tonic: 0, mode: "major" as "major" | "minor", score: -Infinity };
  for (let tonic = 0; tonic < 12; tonic++) {
    for (const [scale, mode] of [[MAJOR_SCALE, "major"], [MINOR_SCALE, "minor"]] as const) {
      let inScale = 0;
      for (const deg of scale) inScale += pcHistogram[(tonic + deg) % 12];
      const tonicWeight = pcHistogram[tonic] * 1.5;
      const score = inScale + tonicWeight;
      if (score > best.score) best = { tonic, mode, score };
    }
  }
  return { tonic: best.tonic, mode: best.mode, confidence: best.score / total };
}

const KEY_OPTIONS: { label: string; tonic: number; mode: "major" | "minor" }[] = [
  { label: "C Major", tonic: 0, mode: "major" },
  { label: "G Major", tonic: 7, mode: "major" },
  { label: "D Major", tonic: 2, mode: "major" },
  { label: "A Major", tonic: 9, mode: "major" },
  { label: "F Major", tonic: 5, mode: "major" },
  { label: "A Minor", tonic: 9, mode: "minor" },
  { label: "E Minor", tonic: 4, mode: "minor" },
  { label: "D Minor", tonic: 2, mode: "minor" },
];

function TrainPage() {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentFreq, setCurrentFreq] = useState(0);
  const [level, setLevel] = useState(0);
  const [detectedKey, setDetectedKey] = useState<{ tonic: number; mode: "major" | "minor"; confidence: number } | null>(null);
  const [targetKey, setTargetKey] = useState(KEY_OPTIONS[0]);
  const [targetDegree, setTargetDegree] = useState(0); // index in scale
  const [hitFlash, setHitFlash] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const histRef = useRef<number[]>(new Array(12).fill(0));
  const lastHitRef = useRef<number>(0);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
      });
      streamRef.current = stream;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 2048;
      src.connect(an);
      analyserRef.current = an;
      histRef.current = new Array(12).fill(0);
      setActive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone unavailable");
    }
  };

  // Detection loop
  useEffect(() => {
    if (!active) return;
    const an = analyserRef.current;
    const ctx = ctxRef.current;
    if (!an || !ctx) return;

    const buf = new Float32Array(an.fftSize);
    const td = new Uint8Array(an.fftSize);
    let frame = 0;

    const tick = () => {
      an.getFloatTimeDomainData(buf);
      an.getByteTimeDomainData(td);
      let sum = 0;
      for (let i = 0; i < td.length; i++) {
        const v = (td[i] - 128) / 128;
        sum += v * v;
      }
      setLevel(Math.min(1, Math.sqrt(sum / td.length) * 3));

      const f = detectPitch(buf, ctx.sampleRate);
      if (f > 0) {
        setCurrentFreq(f);
        const midi = freqToMidi(f);
        const pc = ((Math.round(midi) % 12) + 12) % 12;
        histRef.current[pc] += 1;
        // gentle decay so the key window stays recent (~last 6s)
        if (frame % 30 === 0) {
          histRef.current = histRef.current.map((x) => x * 0.95);
        }

        // Check hit against current target
        const targetMidi = 60 + targetKey.tonic + (targetKey.mode === "major" ? MAJOR_SCALE : MINOR_SCALE)[targetDegree];
        const targetFreq = midiToFreq(targetMidi);
        // octave-agnostic compare
        const diffSemi = ((midi - targetMidi) % 12 + 12) % 12;
        const dist = Math.min(diffSemi, 12 - diffSemi);
        if (dist < 0.5 && Date.now() - lastHitRef.current > 800) {
          lastHitRef.current = Date.now();
          setHitFlash(true);
          setTimeout(() => setHitFlash(false), 400);
          setTargetDegree((d) => (d + 1) % 7);
        }
        void targetFreq;
      }

      if (frame % 20 === 0) {
        const guess = guessKey(histRef.current);
        if (guess) setDetectedKey(guess);
      }
      frame++;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, targetKey, targetDegree]);

  const note = currentFreq > 0 ? midiToNote(freqToMidi(currentFreq)) : null;
  const scale = targetKey.mode === "major" ? MAJOR_SCALE : MINOR_SCALE;
  const targetMidi = 60 + targetKey.tonic + scale[targetDegree];
  const targetNote = midiToNote(targetMidi);
  const targetFreq = midiToFreq(targetMidi);
  const centsOff = note ? Math.round((freqToMidi(currentFreq) - targetMidi) * 100) : 0;
  // Wrap cents to nearest octave for display
  const wrappedCents = ((centsOff + 600) % 1200) - 600;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="font-mono-display uppercase tracking-[0.3em] text-xs text-accent">Live Trainer</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mt-3 mb-3">
            Sing. We'll find your key.
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Vocalo listens in real time, tells you the note and key you're singing, and feeds you the next target note in any scale.
          </p>
        </div>

        {/* Live note display */}
        <div className={`relative rounded-3xl border ${hitFlash ? "border-accent shadow-glow-brand" : "border-border"} bg-surface/70 backdrop-blur-xl p-8 md:p-12 mb-8 transition-all`}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Current */}
            <div className="text-center">
              <div className="font-mono-display uppercase tracking-widest text-xs text-muted-foreground mb-3">You are singing</div>
              <div className="font-display text-7xl md:text-8xl font-extrabold tabular-nums bg-gradient-brand bg-clip-text text-transparent">
                {note ? `${note.name}${note.octave}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground mt-2 font-mono-display">
                {currentFreq > 0 ? `${currentFreq.toFixed(1)} Hz` : active ? "listening…" : "press start"}
              </div>
              {/* Volume bar */}
              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-brand transition-all duration-75" style={{ width: `${level * 100}%` }} />
              </div>
            </div>

            {/* Target */}
            <div className="text-center">
              <div className="font-mono-display uppercase tracking-widest text-xs text-muted-foreground mb-3">Sing this next</div>
              <div className="font-display text-7xl md:text-8xl font-extrabold tabular-nums text-foreground">
                {targetNote.name}<span className="text-muted-foreground text-4xl align-top">{targetNote.octave}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2 font-mono-display">
                {targetFreq.toFixed(1)} Hz · degree {targetDegree + 1} of {targetKey.label}
              </div>
              {/* Tuning meter */}
              <div className="mt-4 relative h-6">
                <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent" />
                {note && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 size-4 rounded-full transition-all ${Math.abs(wrappedCents) < 15 ? "bg-accent shadow-glow-brand" : "bg-brand"}`}
                    style={{ left: `calc(50% + ${Math.max(-50, Math.min(50, wrappedCents / 2))}%)`, transform: "translate(-50%, -50%)" }}
                  />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono-display">
                {note ? `${wrappedCents > 0 ? "+" : ""}${wrappedCents} cents` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Detected key */}
        <div className="rounded-2xl border border-border bg-surface/70 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-mono-display uppercase tracking-widest text-xs text-muted-foreground">Detected key</div>
            <div className="font-display text-3xl font-bold mt-1">
              {detectedKey ? `${NOTE_NAMES[detectedKey.tonic]} ${detectedKey.mode}` : "Sing a few notes…"}
            </div>
          </div>
          {detectedKey && (
            <button
              onClick={() => setTargetKey({ label: `${NOTE_NAMES[detectedKey.tonic]} ${detectedKey.mode === "major" ? "Major" : "Minor"}`, tonic: detectedKey.tonic, mode: detectedKey.mode })}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-sm font-semibold border border-border transition-all"
            >
              Train in this key →
            </button>
          )}
        </div>

        {/* Key picker */}
        <div className="rounded-2xl border border-border bg-surface/70 p-6 mb-8">
          <div className="font-mono-display uppercase tracking-widest text-xs text-muted-foreground mb-4">Pick a key to practice</div>
          <div className="flex flex-wrap gap-2">
            {KEY_OPTIONS.map((k) => {
              const isActive = k.tonic === targetKey.tonic && k.mode === targetKey.mode;
              return (
                <button
                  key={k.label}
                  onClick={() => { setTargetKey(k); setTargetDegree(0); }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${isActive ? "bg-gradient-brand text-primary-foreground border-transparent shadow-glow-brand" : "bg-white/5 hover:bg-white/10 border-border"}`}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
          {/* Scale ladder */}
          <div className="mt-6 flex flex-wrap gap-2">
            {scale.map((deg, i) => {
              const m = 60 + targetKey.tonic + deg;
              const n = midiToNote(m);
              const isCurrent = i === targetDegree;
              return (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-xl border font-mono-display text-sm min-w-16 text-center transition-all ${isCurrent ? "bg-accent/20 border-accent text-foreground" : "border-border text-muted-foreground"}`}
                >
                  <div className="text-xs opacity-60">{i + 1}</div>
                  <div className="font-bold">{n.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!active ? (
            <button
              onClick={start}
              className="px-10 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all"
            >
              🎙️ Start Live Training
            </button>
          ) : (
            <button
              onClick={stop}
              className="px-10 py-4 bg-destructive hover:bg-destructive/90 text-primary-foreground rounded-2xl font-bold transition-all"
            >
              ■ Stop
            </button>
          )}
          <button
            onClick={() => setTargetDegree((d) => (d + 1) % 7)}
            className="px-8 py-4 bg-surface hover:bg-surface/70 border border-border rounded-2xl font-semibold transition-all"
          >
            Skip note →
          </button>
        </div>

        {error && <p className="text-center text-destructive mt-6 text-sm">{error}</p>}

        <p className="text-center text-xs text-muted-foreground mt-8">
          Audio is processed entirely on your device. Nothing is uploaded.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
