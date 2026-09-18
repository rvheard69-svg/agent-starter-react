'use client';

import { useEffect, useState } from 'react';

interface Pulse {
  id: number;
  x: number;
  y: number;
}

let nextPulseId = 0;

export function ClickPulse() {
  const [pulses, setPulses] = useState<Pulse[]>([]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const id = nextPulseId++;
      setPulses((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.id !== id));
      }, 900);
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      {pulses.map((p) => (
        <span
          key={p.id}
          aria-hidden="true"
          className="border-primary pointer-events-none fixed z-40 size-4 rounded-full border-2"
          style={{
            left: p.x,
            top: p.y,
            transform: 'translate(-50%, -50%)',
            animation: 'hud-click-pulse 0.9s ease-out forwards',
          }}
        />
      ))}
    </>
  );
}
