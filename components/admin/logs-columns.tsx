'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { LogEvent } from '@/lib/admin-api';

function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export const logsColumns: ColumnDef<LogEvent>[] = [
  {
    accessorKey: 'ts',
    header: 'Time',
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatTime(row.original.ts)}
      </span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant={row.original.type === 'state' ? 'outline' : 'secondary'}>
        {row.original.type ?? 'event'}
      </Badge>
    ),
  },
  {
    id: 'detail',
    header: 'Detail',
    cell: ({ row }) => {
      const e = row.original;
      if (e.type === 'log') {
        return (
          <span>
            <span className="font-medium">{e.who}: </span>
            {e.text}
          </span>
        );
      }
      if (e.type === 'state') {
        return <span className="font-mono text-xs">{e.value}</span>;
      }
      // Fall back to raw JSON for any event shape not covered above, so a new
      // event type added later still shows something instead of a blank cell.
      const { ts: _ts, type: _type, who: _who, text: _text, value: _value, ...rest } = e;
      return (
        <span className="text-muted-foreground font-mono text-xs">{JSON.stringify(rest)}</span>
      );
    },
  },
];
