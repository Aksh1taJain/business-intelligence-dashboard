import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { TableColumn, SortConfig } from '@/types';
import clsx from 'clsx';

interface DataTableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = 'No data available.',
  loading = false,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const handleSort = (key: keyof T) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    if (aVal < bVal) return -dir;
    if (aVal > bVal) return dir;
    return 0;
  });

  const SortIcon = ({ col: c }: { col: TableColumn<T> }) => {
    if (!c.sortable) return null;
    if (sortConfig?.key !== c.key) return <ChevronsUpDown size={13} className="text-[#334155]" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={13} className="text-blue-400" />
      : <ChevronDown size={13} className="text-blue-400" />;

  };

  return (
    <div className={clsx('overflow-x-auto rounded-xl', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={clsx(
                  'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#475569]',
                  col.sortable && 'cursor-pointer hover:text-white select-none'
                )}
                style={{ width: col.width }}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  <SortIcon col={col} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_col, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div className="h-4 bg-white/5 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-[#475569] text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map(row => (
              <tr
                key={String(row[keyField])}
                className="hover:bg-white/[0.03] transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3.5 text-[#94a3b8]">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
