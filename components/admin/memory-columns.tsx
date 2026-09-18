'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { MemoryEntry } from '@/lib/admin-api';

export const memoryColumns: ColumnDef<MemoryEntry>[] = [
  {
    accessorKey: 'key',
    header: 'Key',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.key}</span>,
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => {
      const v = row.original.value;
      const text = typeof v === 'string' ? v : JSON.stringify(v);
      return <span className="font-mono text-xs whitespace-pre-wrap">{text}</span>;
    },
  },
];
