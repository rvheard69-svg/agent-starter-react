'use client';

import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LogEvent, MemoryEntry, Skill } from '@/lib/admin-api';
import { logsColumns } from './logs-columns';
import { memoryColumns } from './memory-columns';
import { skillsColumns } from './skills-columns';

interface AdminDashboardProps {
  skills: Skill[];
  memory: MemoryEntry[];
  logs: LogEvent[];
}

export function AdminDashboard({ skills, memory, logs }: AdminDashboardProps) {
  return (
    <Tabs defaultValue="skills" className="w-full">
      <TabsList>
        <TabsTrigger value="skills">Skills ({skills.length})</TabsTrigger>
        <TabsTrigger value="memory">Memory ({memory.length})</TabsTrigger>
        <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="skills">
        <DataTable columns={skillsColumns} data={skills} emptyMessage="No skills loaded." />
      </TabsContent>
      <TabsContent value="memory">
        <DataTable columns={memoryColumns} data={memory} emptyMessage="Memory store is empty." />
      </TabsContent>
      <TabsContent value="logs">
        <DataTable
          columns={logsColumns}
          data={[...logs].reverse()}
          emptyMessage="No events logged yet — run a session with livekit_agent.py first."
        />
      </TabsContent>
    </Tabs>
  );
}
