'use client';

import { useEffect, useState } from 'react';
import { getHudHue, setHudHue } from '@/lib/admin-api';

const THEMES = [
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'solar', label: 'Solar Flare' },
  { id: 'matrix', label: 'The Matrix' },
  { id: 'permafrost', label: 'Permafrost' },
] as const;

type ThemeId = (typeof THEMES)[number]['id'];

// Approximate hue (0-360) for each preset's existing --primary color in
// globals.css, so picking a preset here can be expressed as the same single
// number the native HUD's color wheel (D:\Jarvis\ui.py) already uses. 195 is
// ui.py's own _DEFAULT_HUE ("electric cyan-blue"), used verbatim for
// Cyberpunk rather than a slightly-off derived value.
const PRESET_HUES: Record<ThemeId, number> = {
  cyberpunk: 195,
  solar: 27,
  matrix: 140,
  permafrost: 205,
};

const STORAGE_KEY = 'hud-theme';

function circularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function nearestTheme(hue: number): ThemeId {
  let best: ThemeId = 'cyberpunk';
  let bestDist = Infinity;
  for (const t of THEMES) {
    const d = circularDistance(hue, PRESET_HUES[t.id]);
    if (d < bestDist) {
      bestDist = d;
      best = t.id;
    }
  }
  return best;
}

export function HudThemeSwitcher() {
  const [active, setActive] = useState<ThemeId>('cyberpunk');

  function applyTheme(id: ThemeId) {
    setActive(id);
    if (id === 'cyberpunk') {
      document.documentElement.removeAttribute('data-hud-theme');
    } else {
      document.documentElement.setAttribute('data-hud-theme', id);
    }
    localStorage.setItem(STORAGE_KEY, id);
  }

  useEffect(() => {
    // Cached choice first (instant, no flash), then reconcile against the
    // shared hud_hue once the admin API responds - that's the real source
    // of truth if the native HUD's wheel changed it since this last loaded.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.some((t) => t.id === stored)) {
      applyTheme(stored as ThemeId);
    }

    getHudHue()
      .then((hue) => {
        if (hue !== null) applyTheme(nearestTheme(hue));
      })
      .catch(() => {
        // Admin API not running - stay on the cached/default theme, nothing
        // to sync against.
      });
  }, []);

  function select(id: ThemeId) {
    applyTheme(id);
    setHudHue(PRESET_HUES[id]).catch((err) => {
      console.warn('Could not sync theme to the native HUD (hud_hue):', err);
    });
  }

  return (
    <div className="border-primary/30 bg-background/60 fixed top-6 left-6 z-50 rounded-lg border px-4 py-3 backdrop-blur-sm">
      <div className="text-muted-foreground mb-2 font-mono text-[10px] tracking-widest uppercase">
        Theme
      </div>
      <div className="flex gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => select(t.id)}
            className={
              active === t.id
                ? 'bg-primary text-primary-foreground rounded px-2 py-1 font-mono text-[10px] tracking-wide uppercase'
                : 'bg-secondary text-secondary-foreground rounded px-2 py-1 font-mono text-[10px] tracking-wide uppercase transition-opacity hover:opacity-80'
            }
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
