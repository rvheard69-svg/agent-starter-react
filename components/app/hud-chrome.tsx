'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSessionContext } from '@livekit/components-react';
import { HudThemeSwitcher } from '@/components/app/hud-theme-switcher';

/**
 * All of the app's "wording" - nav links, telemetry panels, theme switcher,
 * footer help text - lives here instead of on the welcome screen. It only
 * renders once a call is connected (page 2), so the pre-call screen (page 1)
 * stays down to just the radar dial and the Start Call button.
 */

function useElapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function useJitter(base: number, range: number) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setValue(base + Math.round((Math.random() - 0.5) * range));
    }, 1400);
    return () => clearInterval(id);
  }, [base, range]);
  return value;
}

function HudCorner({
  label,
  lines,
  className,
}: {
  label: string;
  lines: string[];
  className: string;
}) {
  return (
    <div
      className={`border-primary/30 bg-background/50 fixed z-50 rounded-md border px-3 py-2 font-mono text-[10px] tracking-widest uppercase backdrop-blur-sm ${className}`}
    >
      <div className="text-primary flex items-center gap-1.5">
        <span
          className="bg-primary size-1.5 rounded-full"
          style={{ boxShadow: '0 0 6px var(--primary)' }}
        />
        {label}
      </div>
      {lines.map((line) => (
        <div key={line} className="text-foreground/70 mt-0.5">
          {line}
        </div>
      ))}
    </div>
  );
}

function VoiceLinkCorner() {
  const signal = useJitter(97, 4);
  const latency = useJitter(42, 12);
  return (
    <HudCorner
      label="Voice Link"
      lines={[`Signal ${signal}%`, `Latency ${latency}ms`, 'Codec Opus 48kHz']}
      className="bottom-8 left-16"
    />
  );
}

function JarvisCorner() {
  const uptime = useElapsed();
  return (
    <HudCorner
      label="J.A.R.V.I.S. · v1.0"
      lines={[`Uptime ${uptime}`, 'Model Online', 'Region US-West-2']}
      className="right-8 bottom-8 text-right"
    />
  );
}

function SystemStatusCorner() {
  const cpu = useJitter(14, 8);
  return (
    <HudCorner
      label="System"
      lines={['Status Nominal', `CPU ${cpu}%`]}
      className="top-36 left-6 hidden md:block"
    />
  );
}

function BuildCorner() {
  const audioIn = useJitter(-38, 10);
  const mem = useJitter(512, 40);
  return (
    <HudCorner
      label="Build 2026.09.17"
      lines={[`Audio In ${audioIn}dB`, `Mem ${mem}MB`]}
      className="top-20 right-6 hidden text-right md:block"
    />
  );
}

export function HudChrome() {
  const { isConnected } = useSessionContext();

  if (!isConnected) return null;

  return (
    <>
      <HudThemeSwitcher />

      <header className="fixed top-0 right-0 z-50 hidden p-6 md:flex">
        <div className="flex items-center gap-4">
          <span className="text-foreground font-mono text-xs font-bold tracking-wider uppercase">
            Built with{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents"
              className="underline underline-offset-4"
            >
              LiveKit Agents
            </a>
          </span>
          <Link
            href="/admin"
            className="text-foreground font-mono text-xs font-bold tracking-wider uppercase underline-offset-4 hover:underline"
          >
            Admin
          </Link>
        </div>
      </header>

      <VoiceLinkCorner />
      <JarvisCorner />
      <SystemStatusCorner />
      <BuildCorner />
    </>
  );
}
