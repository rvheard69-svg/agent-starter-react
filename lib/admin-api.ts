/**
 * Thin fetch client for admin_api.py (the read-only FastAPI app in D:\Jarvis
 * that exposes skills, memory, and the persisted event log). Points at
 * NEXT_PUBLIC_ADMIN_API_URL, defaulting to the local dev port it's meant to
 * run on.
 */
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? 'http://localhost:8000';

export interface Skill {
  name: string;
  description: string;
  triggers: string[];
  file: string;
  valid: boolean;
  error: string;
}

export interface MemoryEntry {
  key: string;
  value: unknown;
}

export interface LogEvent {
  ts: number;
  type?: string;
  who?: string;
  text?: string;
  value?: string;
  [key: string]: unknown;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${ADMIN_API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Admin API request to ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const getSkills = () => getJSON<Skill[]>('/api/skills');
export const getMemory = () => getJSON<MemoryEntry[]>('/api/memory');
export const getLogs = (limit = 200) => getJSON<LogEvent[]>(`/api/logs?limit=${limit}`);

/**
 * hud_hue is shared with the native desktop HUD (D:\Jarvis\ui.py) - picking
 * a color in either app writes to the same memory.py key, via admin_api.py's
 * one narrow write endpoint (POST /api/memory/hud_hue, hue only, nothing
 * else). Used by hud-theme-switcher.tsx to stay in sync with it.
 */
export async function getHudHue(): Promise<number | null> {
  const entries = await getMemory();
  const entry = entries.find((e) => e.key === 'hud_hue');
  return typeof entry?.value === 'number' ? entry.value : null;
}

export async function setHudHue(hue: number): Promise<void> {
  const res = await fetch(`${ADMIN_API_URL}/api/memory/hud_hue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hue }),
  });
  if (!res.ok) {
    throw new Error(`Failed to set hud_hue: ${res.status} ${res.statusText}`);
  }
}
