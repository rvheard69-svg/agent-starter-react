'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { type Variants, motion } from 'motion/react';
import { useAgent, useSessionContext } from '@livekit/components-react';
import { HudRing } from '@/components/app/hud-ring';
import { HudThemeSwitcher } from '@/components/app/hud-theme-switcher';
import { JarvisCore } from '@/components/app/jarvis-core';
import { useTrackVolume } from '@/hooks/useTrackVolume';

/**
 * All of the app's "wording" - nav links, telemetry panels, theme switcher,
 * footer help text - lives here instead of on the welcome screen. It only
 * renders once a call is connected (page 2), so the pre-call screen (page 1)
 * stays down to just the radar dial and the Start Call button.
 */

// Only the header and corner elements below stagger in on boot - each one
// is position:fixed and carries its own animated transform, so it never
// becomes a containing block for a *different* fixed element. Wrapping a
// fixed element in a separate animated parent would break that fixed
// positioning instead (the parent's transform would become the fixed
// child's containing block), so this must stay on the elements themselves.
const BOOT_CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const BOOT_ITEM: Variants = {
  hidden: { opacity: 0, y: 8, filter: 'brightness(2.5)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'brightness(1)',
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

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

/** Each corner flickers independently every 20-40s, like real hardware still ticking over. */
function useIdleGlitch() {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    let flickerTimeout: ReturnType<typeof setTimeout>;
    let scheduleTimeout: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      const delay = 20_000 + Math.random() * 20_000;
      scheduleTimeout = setTimeout(() => {
        setGlitching(true);
        flickerTimeout = setTimeout(() => {
          setGlitching(false);
          scheduleNext();
        }, 100);
      }, delay);
    }
    scheduleNext();

    return () => {
      clearTimeout(scheduleTimeout);
      clearTimeout(flickerTimeout);
    };
  }, []);

  return glitching;
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
  const glitching = useIdleGlitch();

  return (
    <motion.div
      variants={BOOT_ITEM}
      className={`border-primary/30 bg-background/50 fixed z-50 rounded-md border px-3 py-2 font-mono text-[10px] tracking-widest uppercase backdrop-blur-sm ${className}`}
      style={{
        boxShadow: glitching
          ? 'inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 30%, transparent), inset 0 0 20px -10px var(--primary), 0 0 10px 1px var(--primary)'
          : 'inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 12%, transparent), inset 0 0 20px -10px var(--primary)',
      }}
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
    </motion.div>
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

/** Faint CRT scanlines + edge vignette so the HUD reads as a display, not a webpage. */
function ScanlineOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        backgroundImage: [
          'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, color-mix(in srgb, var(--foreground) 4%, transparent) 3px, transparent 4px)',
          'radial-gradient(circle at center, transparent 55%, color-mix(in srgb, var(--background) 55%, transparent) 100%)',
        ].join(', '),
      }}
    />
  );
}

interface LogLine {
  id: string;
  time: string;
  text: string;
}

const MAX_LOG_LINES = 5;

/** Short, human-readable line for each real agent-state transition - not jittered filler. */
const STATE_LOG_MESSAGES: Partial<Record<string, string>> = {
  'pre-connect-buffering': 'buffering pre-connect audio',
  initializing: 'agent initializing',
  listening: 'listening for input',
  thinking: 'processing request',
  speaking: 'agent responding',
  failed: 'agent connection failed',
};

function timestamp() {
  return new Date().toTimeString().slice(0, 8);
}

/** A live feed of real session/agent-state events, not simulated telemetry. */
function SystemLogTicker() {
  const { isConnected } = useSessionContext();
  const agent = useAgent();
  const [lines, setLines] = useState<LogLine[]>([]);
  const prevAgentState = useRef<string | null>(null);
  const hasLoggedConnect = useRef(false);

  function push(text: string) {
    // A fresh id per call, independent of any ref/counter React might re-invoke -
    // avoids the duplicate-key bug a manually incremented ref hit under Strict Mode's
    // double-invoked updaters.
    const id = crypto.randomUUID();
    setLines((prev) => [...prev.slice(-(MAX_LOG_LINES - 1)), { id, time: timestamp(), text }]);
  }

  useEffect(() => {
    if (isConnected && !hasLoggedConnect.current) {
      hasLoggedConnect.current = true;
      push('session established');
    }
    if (!isConnected) hasLoggedConnect.current = false;
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected || prevAgentState.current === agent.state) return;
    const message = STATE_LOG_MESSAGES[agent.state];
    if (message) push(message);
    prevAgentState.current = agent.state;
  }, [agent.state, isConnected]);

  return (
    <div className="fixed top-1/2 left-6 z-40 hidden w-56 -translate-y-1/2 lg:block">
      <div className="flex flex-col gap-1">
        {lines.map((line) => (
          <div
            key={line.id}
            className="text-foreground/60 font-mono text-[10px] tracking-wide"
            style={{ animation: 'hud-log-in 0.3s ease-out' }}
          >
            <span className="text-primary/70">[{line.time}]</span> {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

const SPEECH_PULSE_THRESHOLD = 0.15;
const SPEECH_PULSE_MIN_INTERVAL_MS = 220;

/**
 * Fires a ripple - the same hud-click-pulse used for real mouse clicks - each
 * time speech volume rises back above a threshold from below it. That onset
 * detection (rather than firing every frame while loud) is what makes the
 * ripples land roughly on syllable/word boundaries instead of one continuous
 * blur during a sustained loud passage.
 */
function useSpeechPulses(volume: number) {
  const [pulses, setPulses] = useState<number[]>([]);
  const wasBelowThreshold = useRef(true);
  const lastPulseAt = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    const now = performance.now();
    const isAboveThreshold = volume > SPEECH_PULSE_THRESHOLD;
    if (
      isAboveThreshold &&
      wasBelowThreshold.current &&
      now - lastPulseAt.current > SPEECH_PULSE_MIN_INTERVAL_MS
    ) {
      const id = nextId.current++;
      lastPulseAt.current = now;
      setPulses((prev) => [...prev, id]);
      setTimeout(() => setPulses((prev) => prev.filter((p) => p !== id)), 900);
    }
    wasBelowThreshold.current = !isAboveThreshold;
  }, [volume]);

  return pulses;
}

/** The Jarvis core, with a radar-ring halo that pulses with the agent's live voice amplitude. */
function VoiceHalo() {
  const agent = useAgent();
  const volume = useTrackVolume(agent.state === 'speaking' ? agent.microphoneTrack : undefined);
  const pulses = useSpeechPulses(volume);

  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.18]">
        <HudRing level={volume} />
      </div>
      {pulses.map((id) => (
        <span
          key={id}
          aria-hidden="true"
          className="border-primary pointer-events-none absolute top-1/2 left-1/2 size-4 rounded-full border-2"
          style={{
            transform: 'translate(-50%, -50%)',
            animation: 'hud-click-pulse 0.9s ease-out forwards',
          }}
        />
      ))}
      <JarvisCore className="relative size-16 drop-shadow-[0_0_14px_var(--primary)]" />
    </div>
  );
}

export function HudChrome() {
  const { isConnected } = useSessionContext();

  if (!isConnected) return null;

  return (
    <motion.div initial="hidden" animate="visible" variants={BOOT_CONTAINER}>
      <HudThemeSwitcher />

      <motion.header variants={BOOT_ITEM} className="fixed top-0 right-0 z-50 hidden p-6 md:flex">
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
      </motion.header>

      <VoiceLinkCorner />
      <JarvisCorner />
      <SystemStatusCorner />
      <BuildCorner />
      <VoiceHalo />
      <SystemLogTicker />
      <ScanlineOverlay />
    </motion.div>
  );
}
