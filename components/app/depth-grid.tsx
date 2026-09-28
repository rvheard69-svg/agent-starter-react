/**
 * A second, much slower and fainter background layer than NeuralBackground's
 * particle canvas - a drifting grid plane behind it, so the two motions read
 * as separate depths instead of one flat layer.
 */
export function DepthGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-30 opacity-30"
      style={{
        backgroundImage: [
          'linear-gradient(color-mix(in srgb, var(--primary) 25%, transparent) 1px, transparent 1px)',
          'linear-gradient(90deg, color-mix(in srgb, var(--primary) 25%, transparent) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '56px 56px',
        animation: 'depth-grid-drift 60s linear infinite',
      }}
    />
  );
}
