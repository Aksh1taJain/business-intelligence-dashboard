/**
 * src/components/ui/PreviewTable.tsx
 *
 * Generic table for showing import preview data.
 * Handles empty state, horizontal scroll, and truncated cell values.
 */

import type { ColumnDescriptor } from '@/services/importService';

interface PreviewTableProps {
  columns: ColumnDescriptor[];
  rows: Record<string, string>[];
  totalRows: number;
  previewing: number;
}

export function PreviewTable({ columns, rows, totalRows, previewing }: PreviewTableProps) {
  if (columns.length === 0) {
    return (
      <p className="text-xs text-[#475569] py-4 text-center">No data to preview.</p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#64748b]">
          Showing{' '}
          <span className="text-white font-medium data-value">{previewing}</span>
          {' '}of{' '}
          <span className="text-white font-medium data-value">{totalRows.toLocaleString()}</span>
          {' '}rows
        </p>
        <span className="text-[11px] text-[#334155]">
          {columns.length} column{columns.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable table container */}
      <div
        className="overflow-x-auto rounded-lg"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <table className="w-full text-xs min-w-max">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th
                className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#334155] w-10 flex-shrink-0"
              >
                #
              </th>
              {columns.map(col => (
                <th
                  key={col.name}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#475569] whitespace-nowrap"
                >
                  <div>{col.name}</div>
                  {col.sample && (
                    <div className="text-[#334155] font-normal normal-case tracking-normal mt-0.5 max-w-[140px] truncate">
                      e.g. {col.sample}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td className="px-3 py-2.5 text-[#334155] data-value font-mono">{rowIdx + 1}</td>
                {columns.map(col => (
                  <td
                    key={col.name}
                    className="px-3 py-2.5 text-[#94a3b8] max-w-[200px] truncate whitespace-nowrap"
                    title={row[col.name]}
                  >
                    {row[col.name] || (
                      <span className="text-[#334155] italic">empty</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
