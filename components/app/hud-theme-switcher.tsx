'use client';

import { useEffect, useState } from 'react';

const THEMES = [
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'solar', label: 'Solar Flare' },
  { id: 'matrix', label: 'The Matrix' },
  { id: 'permafrost', label: 'Permafrost' },
] as const;

const STORAGE_KEY = 'hud-theme';

export function HudThemeSwitcher() {
  const [active, setActive] = useState<string>('cyberpunk');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActive(stored);
      if (stored !== 'cyberpunk') {
        document.documentElement.setAttribute('data-hud-theme', stored);
      }
    }
  }, []);

  function select(id: string) {
    setActive(id);
    if (id === 'cyberpunk') {
      document.documentElement.removeAttribute('data-hud-theme');
    } else {
      document.documentElement.setAttribute('data-hud-theme', id);
    }
    localStorage.setItem(STORAGE_KEY, id);
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
