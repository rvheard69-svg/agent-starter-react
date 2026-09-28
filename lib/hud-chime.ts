/**
 * Synthesized two-note confirmation chime per HUD theme preset - no audio
 * assets, just Web Audio oscillators, so pitch and character are easy to
 * retune per theme. Always called from a click handler, which satisfies the
 * browser's autoplay-requires-a-user-gesture rule.
 */

type ThemeId = 'cyberpunk' | 'solar' | 'matrix' | 'permafrost';

const CHIME_NOTES: Record<ThemeId, [number, number]> = {
  cyberpunk: [880, 1320],
  solar: [440, 660],
  matrix: [523, 784],
  permafrost: [1046, 1568],
};

let sharedContext: AudioContext | null = null;

export function playHudChime(themeId: ThemeId) {
  if (typeof window === 'undefined') return;

  sharedContext ??= new AudioContext();
  const ctx = sharedContext;
  if (ctx.state === 'suspended') void ctx.resume();

  const [first, second] = CHIME_NOTES[themeId];
  const now = ctx.currentTime;

  for (const { freq, start, duration } of [
    { freq: first, start: 0, duration: 0.12 },
    { freq: second, start: 0.09, duration: 0.16 },
  ]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(0.08, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  }
}
