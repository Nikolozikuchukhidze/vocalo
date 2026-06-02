export function HeroVisualizer() {
  const bars = Array.from({ length: 28 });
  return (
    <div className="relative w-full aspect-square rounded-3xl border border-border overflow-hidden bg-surface/40 backdrop-blur-xl">
      {/* Ambient gradient orbs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand/30 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-brand-secondary/30 blur-3xl" />
      <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full bg-brand-accent/20 blur-3xl" />

      {/* Concentric rings */}
      <div className="absolute inset-0 grid place-items-center">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-brand/20"
            style={{
              width: `${30 + i * 18}%`,
              height: `${30 + i * 18}%`,
              animation: `pulse-ring 3s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}

        {/* Central mic */}
        <div className="relative z-10 size-28 rounded-full bg-gradient-brand grid place-items-center shadow-glow-brand">
          <span className="text-5xl">🎙️</span>
        </div>
      </div>

      {/* Equalizer */}
      <div className="absolute bottom-8 left-0 right-0 flex items-end justify-center gap-1.5 h-24 px-8">
        {bars.map((_, i) => (
          <span
            key={i}
            className="eq-bar w-1.5 rounded-full bg-gradient-to-t from-brand via-brand-secondary to-brand-accent"
            style={{
              height: `${30 + (i % 7) * 10}%`,
              animationDelay: `${(i % 9) * 0.12}s`,
              animationDuration: `${0.9 + (i % 5) * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Frequency readout */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between text-[10px] font-mono-display uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Signal
        </span>
        <span className="text-accent">440 Hz · A4</span>
      </div>
    </div>
  );
}
