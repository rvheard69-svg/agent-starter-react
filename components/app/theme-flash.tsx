'use client';

import { useEffect, useState } from 'react';

export const THEME_FLASH_EVENT = 'hud-theme-flash';

/**
 * A brief radial color wash run through the chromatic-aberration SVG filter
 * (defined once in the root layout) on every theme switch. This is a leaf
 * fixed element with no fixed descendants of its own, so the filter never
 * becomes a containing block problem for the corners/header - see the note
 * on HudCorner in hud-chrome.tsx for why that matters here.
 */
export function ThemeFlash() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function handleFlash() {
      setActive(true);
      const timeout = setTimeout(() => setActive(false), 260);
      return () => clearTimeout(timeout);
    }
    window.addEventListener(THEME_FLASH_EVENT, handleFlash);
    return () => window.removeEventListener(THEME_FLASH_EVENT, handleFlash);
  }, []);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        background:
          'radial-gradient(circle at center, color-mix(in srgb, var(--primary) 55%, transparent), transparent 70%)',
        filter: 'url(#chromatic-aberration)',
        animation: 'hud-theme-flash 0.26s ease-out forwards',
      }}
    />
  );
}
