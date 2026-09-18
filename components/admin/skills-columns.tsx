'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { Skill } from '@/lib/admin-api';

export const skillsColumns: ColumnDef<Skill>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.name}</span>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'triggers',
    header: 'Triggers',
    cell: ({ row }) => (
      <div className="flex max-w-md flex-wrap gap-1">
        {row.original.triggers.map((t) => (
          <Badge key={t} variant="secondary" className="font-mono">
            {t}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'file',
    header: 'File',
    cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.file}</span>,
  },
];
