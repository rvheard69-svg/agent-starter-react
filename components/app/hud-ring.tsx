const TICK_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);

interface HudRingProps {
  /** 0..1 live signal (e.g. voice amplitude). 0 keeps the original ambient idle look. */
  level?: number;
  children?: React.ReactNode;
}

export function HudRing({ level = 0, children }: HudRingProps) {
  const glowPct = Math.round((0.14 + level * 0.4) * 100);
  const sweepSeconds = Math.max(1.2, 8 - level * 6);

  return (
    <div className="relative flex size-[30rem] items-center justify-center">
      {/* Soft glow filling the dial, clipped to a perfect circle */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, color-mix(in srgb, var(--primary) ${glowPct}%, transparent), transparent 75%)`,
          animation: 'hud-glow-pulse 8s ease-in-out infinite',
        }}
      />

      {/* Outer + mid + inner static rings */}
      <span className="border-primary/30 absolute inset-0 rounded-full border" />
      <span className="border-primary/60 absolute inset-18 rounded-full border" />
      <span className="border-primary/25 absolute inset-40 rounded-full border" />

      {/* Tick marks around the outer ring - major every 30deg, minor every 15deg */}
      {TICK_ANGLES.map((angle) => {
        const isMajor = angle % 30 === 0;
        return (
          <span
            key={angle}
            className={
              isMajor
                ? 'bg-primary/70 absolute top-1/2 left-1/2 w-px origin-bottom'
                : 'bg-primary/35 absolute top-1/2 left-1/2 w-px origin-bottom'
            }
            style={{
              height: isMajor ? '0.9rem' : '0.5rem',
              transform: `rotate(${angle}deg) translateY(-15rem)`,
            }}
          />
        );
      })}

      {/* Slow-expanding pulse rings */}
      <span
        className="border-primary/50 absolute inset-18 rounded-full border"
        style={{ animation: 'hud-pulse 3s ease-out infinite' }}
      />
      <span
        className="border-primary/40 absolute inset-18 rounded-full border"
        style={{ animation: 'hud-pulse 3s ease-out infinite 1.5s' }}
      />

      {/* Radar sweep hand - speeds up with a stronger live level */}
      <div
        className="absolute inset-18 rounded-full"
        style={{ animation: `spin ${sweepSeconds}s linear infinite` }}
      >
        <span
          className="absolute top-1/2 left-1/2 h-1/2 w-px origin-top"
          style={{
            background: 'linear-gradient(to bottom, var(--primary), transparent)',
          }}
        />
      </div>

      {children}
    </div>
  );
}
