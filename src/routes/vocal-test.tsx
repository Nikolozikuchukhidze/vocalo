import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

type Phase = "intro" | "permission" | "low" | "high" | "analyzing" | "done" | "error";

const phaseCopy: Record<Phase, { title: string; sub: string; note: string }> = {
  intro: {
    title: "Ready to find your range?",
    sub: "We'll capture your lowest and highest comfortable notes. Total time: about 45 seconds.",
    note: "Use headphones in a quiet room for best accuracy.",
  },
  permission: {
    title: "Requesting microphone access",
    sub: "Your browser will ask permission to use the mic. Audio is processed locally and never uploaded.",
    note: "Waiting for permission…",
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
    note: "Recording complete",
  },
  error: {
    title: "Microphone unavailable",
    sub: "We couldn't access your microphone. Check your browser permissions and try again.",
    note: "Permission denied or no input device detected.",
  },
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function freqToNote(freq: number): string {
  if (freq <= 0) return "—";
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

// Autocorrelation-based pitch detection
function detectPitch(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // too quiet

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

  const trimmed = buf.slice(r1, r2);
  const T = trimmed.length;
  const c = new Array(T).fill(0);
  for (let i = 0; i < T; i++) for (let j = 0; j < T - i; j++) c[i] += trimmed[j] * trimmed[j + i];

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < T; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }
  let T0 = maxpos;
  if (T0 <= 0) return -1;

  const x1 = c[T0 - 1] ?? 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  const freq = sampleRate / T0;
  if (freq < 50 || freq > 1100) return -1;
  return freq;
}

function VocalTest() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(0);
  const [currentFreq, setCurrentFreq] = useState<number>(0);
  const [lowNote, setLowNote] = useState<{ freq: number; name: string } | null>(null);
  const [highNote, setHighNote] = useState<{ freq: number; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const navigate = useNavigate();
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const pitchesRef = useRef<number[]>([]);

  const stopStream = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  useEffect(() => () => stopStream(), []);

  const requestMicAndStart = async () => {
    setPhase("permission");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
      });
      streamRef.current = stream;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      setPhase("low");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(msg);
      setPhase("error");
    }
  };

  // Recording loop for low/high phases
  useEffect(() => {
    if (phase !== "low" && phase !== "high") return;
    pitchesRef.current = [];
    setProgress(0);
    setCurrentFreq(0);
    const analyser = analyserRef.current;
    const ctx = audioCtxRef.current;
    if (!analyser || !ctx) return;

    const buf = new Float32Array(analyser.fftSize);
    const timeData = new Uint8Array(analyser.fftSize);
    const start = Date.now();
    const total = 4500;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);

      analyser.getFloatTimeDomainData(buf);
      analyser.getByteTimeDomainData(timeData);
      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        sum += v * v;
      }
      setLevel(Math.min(1, Math.sqrt(sum / timeData.length) * 3));

      const f = detectPitch(buf, ctx.sampleRate);
      if (f > 0) {
        setCurrentFreq(f);
        pitchesRef.current.push(f);
      }

      if (pct >= 100) {
        const pitches = [...pitchesRef.current].sort((a, b) => a - b);
        if (pitches.length > 0) {
          if (phase === "low") {
            // take 20th percentile to filter outliers
            const f = pitches[Math.floor(pitches.length * 0.2)];
            setLowNote({ freq: f, name: freqToNote(f) });
            setPhase("high");
          } else {
            const f = pitches[Math.floor(pitches.length * 0.8)];
            setHighNote({ freq: f, name: freqToNote(f) });
            setPhase("analyzing");
          }
        } else {
          // no pitch detected — keep going but mark unknown
          if (phase === "low") setPhase("high");
          else setPhase("analyzing");
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Analyzing -> done
  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = window.setTimeout(() => {
      stopStream();
      setPhase("done");
    }, 2500);
    return () => window.clearTimeout(t);
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
                {phase === "error"
                  ? "Permission required"
                  : `Step ${phase === "intro" || phase === "permission" ? "0" : phase === "low" ? "1" : phase === "high" ? "2" : "3"} of 3`}
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-4 mb-3">
                {copy.title}
              </h1>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto">{copy.sub}</p>

              {/* Mic visualizer */}
              <div className="relative grid place-items-center mb-10 h-56">
                {recording && (
                  <>
                    <div
                      className="absolute rounded-full border border-brand/40 transition-all"
                      style={{ width: `${160 + level * 120}px`, height: `${160 + level * 120}px` }}
                    />
                    <div className="absolute size-56 rounded-full border border-brand/20" style={{ animation: "pulse-ring 1.5s ease-out 0.4s infinite" }} />
                  </>
                )}
                <button
                  type="button"
                  disabled={phase === "analyzing" || phase === "permission"}
                  onClick={() => {
                    if (phase === "intro" || phase === "error") void requestMicAndStart();
                    if (phase === "done" && lowNote && highNote) {
                      navigate({
                        to: "/sample-results",
                        search: {
                          low: lowNote.name,
                          high: highNote.name,
                          lowF: Math.round(lowNote.freq * 10) / 10,
                          highF: Math.round(highNote.freq * 10) / 10,
                        },
                      });
                    }
                  }}
                  className={`relative size-32 rounded-full grid place-items-center text-5xl transition-all ${
                    recording
                      ? "bg-destructive mic-pulse"
                      : phase === "analyzing" || phase === "permission"
                        ? "bg-surface border border-border"
                        : phase === "error"
                          ? "bg-destructive/20 border border-destructive"
                          : "bg-gradient-brand shadow-glow-brand hover:scale-105"
                  }`}
                >
                  {phase === "analyzing" || phase === "permission" ? (
                    <span className="size-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : phase === "done" ? (
                    "✓"
                  ) : phase === "error" ? (
                    "⚠"
                  ) : (
                    "🎙️"
                  )}
                </button>
              </div>

              {/* Live pitch readout */}
              {recording && (
                <div className="mb-4 font-mono-display text-sm text-muted-foreground">
                  Detected: <span className="text-foreground font-bold">{currentFreq > 0 ? `${freqToNote(currentFreq)} (${currentFreq.toFixed(1)} Hz)` : "listening…"}</span>
                </div>
              )}

              {/* Progress */}
              {(recording || phase === "analyzing") && (
                <div className="mb-6">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-brand transition-all duration-100"
                      style={{ width: `${phase === "analyzing" ? 100 : progress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs font-mono-display uppercase tracking-widest text-muted-foreground mb-8">
                {phase === "done" && lowNote && highNote
                  ? `${lowNote.name} — ${highNote.name}`
                  : copy.note}
              </p>

              {phase === "error" && errorMsg && (
                <p className="text-sm text-destructive mb-6">{errorMsg}</p>
              )}

              {(phase === "intro" || phase === "error") && (
                <button
                  onClick={requestMicAndStart}
                  className="w-full sm:w-auto px-10 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all"
                >
                  {phase === "error" ? "Try Again" : "Allow Microphone & Start"}
                </button>
              )}

              {phase === "done" && lowNote && highNote && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/sample-results"
                    search={{
                      low: lowNote.name,
                      high: highNote.name,
                      lowF: Math.round(lowNote.freq * 10) / 10,
                      highF: Math.round(highNote.freq * 10) / 10,
                    }}
                    className="px-8 py-4 bg-brand hover:bg-brand/90 text-primary-foreground rounded-2xl font-bold shadow-glow-brand transition-all"
                  >
                    See My Results →
                  </Link>
                  <button
                    onClick={() => {
                      setLowNote(null);
                      setHighNote(null);
                      void requestMicAndStart();
                    }}
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
