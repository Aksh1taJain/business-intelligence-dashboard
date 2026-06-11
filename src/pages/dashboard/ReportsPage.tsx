import { useState } from 'react';
import { FileText, Download, RefreshCw, Plus, Search, Filter } from 'lucide-react';
import { mockReports, formatDate } from '@/data/mockData';
import { Card, StatusBadge, PageHeader, Tag, EmptyState } from '@/components/ui/index';
import type { Report, ReportFormat, ReportStatus } from '@/types';
import clsx from 'clsx';

const formatBadgeColor: Record<ReportFormat, string> = {
  PDF:   'text-rose-400 bg-rose-400/10',
  CSV:   'text-emerald-400 bg-emerald-400/10',
  Excel: 'text-blue-400 bg-blue-400/10',
  JSON:  'text-amber-400 bg-amber-400/10',
};

const statusFilters: { label: string; value: ReportStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Ready', value: 'ready' },
  { label: 'Processing', value: 'processing' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Failed', value: 'failed' },
];

export function ReportsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

  const filtered = mockReports.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockReports.length,
    ready: mockReports.filter(r => r.status === 'ready').length,
    processing: mockReports.filter(r => r.status === 'processing').length,
    scheduled: mockReports.filter(r => r.status === 'scheduled').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate, schedule, and export data reports"
        actions={
          <button className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> New Report
          </button>
        }
      />

      {/* ─── Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#64748b' },
          { label: 'Ready', value: stats.ready, color: '#10b981' },
          { label: 'Processing', value: stats.processing, color: '#3b82f6' },
          { label: 'Scheduled', value: stats.scheduled, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="data-value text-2xl font-bold text-white mb-1" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-[#64748b]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Filters ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-0 max-w-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Search size={14} className="text-[#475569] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search reports…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-white placeholder-[#475569] text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-[#475569]" />
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'text-[#64748b] hover:text-white'
              )}
              style={statusFilter === f.value ? {} : { background: 'rgba(255,255,255,0.04)' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Reports List ──────────────────────────────────────── */}
      <Card noPad>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} />}
            title="No reports found"
            description="Try adjusting your filters or search query."
          />
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((report: Report) => (
              <div
                key={report.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Format Icon */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5',
                    formatBadgeColor[report.format]
                  )}
                >
                  {report.format}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-white">{report.name}</p>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed max-w-xl">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-[11px] text-[#334155]">
                      {formatDate(report.updatedAt)} · by {report.createdBy}
                    </span>
                    {report.size && (
                      <span className="text-[11px] text-[#334155]">{report.size}</span>
                    )}
                    <div className="flex items-center gap-1.5">
                      {report.tags.map(tag => <Tag key={tag} label={tag} />)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    className="p-2 rounded-lg text-[#475569] hover:text-white hover:bg-white/5 transition-all"
                    title="Refresh"
                  >
                    <RefreshCw size={14} />
                  </button>
                  {report.status === 'ready' && (
                    <button
                      className="p-2 rounded-lg text-[#3b82f6] hover:bg-blue-500/10 transition-all"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
