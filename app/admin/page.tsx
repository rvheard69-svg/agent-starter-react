import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getLogs, getMemory, getSkills } from '@/lib/admin-api';
import type { LogEvent, MemoryEntry, Skill } from '@/lib/admin-api';

// Fetched server-side on every request (see admin-api.ts's cache: 'no-store')
// so this always reflects the current skills/memory/logs on disk without a
// manual refresh button.
export default async function AdminPage() {
  let skills: Skill[] = [];
  let memory: MemoryEntry[] = [];
  let logs: LogEvent[] = [];
  let apiError: string | null = null;

  try {
    [skills, memory, logs] = await Promise.all([getSkills(), getMemory(), getLogs()]);
  } catch (err) {
    apiError = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="relative mx-auto min-h-svh max-w-5xl px-6 py-24">
      <div className="mb-8 flex items-center gap-2">
        <span
          className="bg-primary size-2 rounded-full"
          style={{ boxShadow: '0 0 8px var(--primary)' }}
        />
        <h1 className="text-primary font-mono text-sm font-bold tracking-widest uppercase">
          Jarvis Admin
        </h1>
      </div>
      <p className="text-muted-foreground mb-8 font-mono text-xs tracking-wide uppercase">
        Skills, persistent memory, and recent session events - read from D:\Jarvis
      </p>

      {apiError ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-4 font-mono text-xs backdrop-blur-sm">
          <p className="tracking-wide uppercase">Couldn&apos;t reach the admin API.</p>
          <p className="mt-2 normal-case">
            Make sure it&apos;s running:{' '}
            <code className="bg-background/50 rounded px-1.5 py-0.5">
              .venv\Scripts\python.exe -m uvicorn admin_api:app --port 8000
            </code>
          </p>
          <p className="text-muted-foreground mt-2 normal-case">{apiError}</p>
        </div>
      ) : (
        <AdminDashboard skills={skills} memory={memory} logs={logs} />
      )}
    </main>
  );
}
