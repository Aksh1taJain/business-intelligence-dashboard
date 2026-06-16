import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Plus, Search, Filter, Loader2 } from 'lucide-react';
import { reportService, type ApiReport } from '@/services/reportService';
import { formatDate } from '@/data/mockData';
import { Card, StatusBadge, PageHeader, Tag, EmptyState } from '@/components/ui/index';
import { NewReportModal } from '@/components/ui/NewReportModal';
import type { ReportFormat, ReportStatus } from '@/types';
import clsx from 'clsx';

const formatBadgeColor: Record<ReportFormat, string> = {
  PDF:   'text-rose-400 bg-rose-400/10',
  CSV:   'text-emerald-400 bg-emerald-400/10',
  Excel: 'text-blue-400 bg-blue-400/10',
  JSON:  'text-amber-400 bg-amber-400/10',
};

const statusFilters: { label: string; value: ReportStatus | 'all' }[] = [
  { label: 'All',        value: 'all' },
  { label: 'Ready',      value: 'ready' },
  { label: 'Processing', value: 'processing' },
  { label: 'Scheduled',  value: 'scheduled' },
  { label: 'Failed',     value: 'failed' },
];

function fmtBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ReportsPage() {
  const [reports,       setReports]       = useState<ApiReport[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [loadError,     setLoadError]     = useState<string | null>(null);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<ReportStatus | 'all'>('all');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [downloading,   setDownloading]   = useState<string | null>(null);  // report id being downloaded

  const loadReports = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await reportService.list();
      setReports(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleDownload = async (report: ApiReport) => {
    if (downloading) return;
    setDownloading(report.id);
    try {
      const ext = report.format === 'Excel' ? 'xlsx' : report.format.toLowerCase();
      const filename = `${report.name.replace(/[^a-z0-9_\-]/gi, '_')}.${ext}`;
      await reportService.download(report.id, filename);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  // ── Filter locally ────────────────────────────────────────────────────────
  const filtered = reports.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:      reports.length,
    ready:      reports.filter(r => r.status === 'ready').length,
    processing: reports.filter(r => r.status === 'processing').length,
    scheduled:  reports.filter(r => r.status === 'scheduled').length,
  };

  return (
    <div className="space-y-6">
      {/* Modal — unchanged UI wrapper */}
      <NewReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadReports}
      />

      <PageHeader
        title="Reports"
        subtitle="Generate, schedule, and export data reports"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus size={14} /> New Report
          </button>
        }
      />

      {/* ─── Summary Cards — identical markup to original ──────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',      value: stats.total,      color: '#64748b' },
          { label: 'Ready',      value: stats.ready,      color: '#10b981' },
          { label: 'Processing', value: stats.processing, color: '#3b82f6' },
          { label: 'Scheduled',  value: stats.scheduled,  color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="data-value text-2xl font-bold text-white mb-1" style={{ color: s.color }}>
              {loading ? '—' : s.value}
            </div>
            <div className="text-xs text-[#64748b]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Filters — identical markup to original ────────────────── */}
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
                  : 'text-[#64748b] hover:text-white',
              )}
              style={statusFilter === f.value ? {} : { background: 'rgba(255,255,255,0.04)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="text-[#475569] hover:text-white transition-colors disabled:opacity-40 ml-auto"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ─── Reports List ──────────────────────────────────────────── */}
      <Card noPad>
        {/* Loading skeleton */}
        {loading && (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-white/5 rounded w-48" />
                  <div className="h-2.5 bg-white/5 rounded w-72" />
                  <div className="h-2 bg-white/5 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && loadError && (
          <div className="px-5 py-8 text-center text-xs text-rose-400">{loadError}</div>
        )}

        {/* Empty */}
        {!loading && !loadError && filtered.length === 0 && (
          <EmptyState
            icon={<FileText size={24} />}
            title={reports.length === 0 ? 'No reports yet' : 'No reports found'}
            description={
              reports.length === 0
                ? 'Click "New Report" to generate your first report from an imported dataset.'
                : 'Try adjusting your filters or search query.'
            }
            action={
              reports.length === 0 ? (
                <button onClick={() => setModalOpen(true)} className="btn-primary text-xs flex items-center gap-2">
                  <Plus size={13} /> New Report
                </button>
              ) : undefined
            }
          />
        )}

        {/* Report rows — same structure as original */}
        {!loading && !loadError && filtered.length > 0 && (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((report: ApiReport) => (
              <div
                key={report.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Format badge — same as original */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5',
                    formatBadgeColor[report.format],
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

                  {report.description && (
                    <p className="text-xs text-[#64748b] mt-1 leading-relaxed max-w-xl">
                      {report.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-[11px] text-[#334155]">
                      {formatDate(report.created_at)} · by {report.created_by_name}
                    </span>
                    {report.file_size_bytes != null && (
                      <span className="text-[11px] text-[#334155]">
                        {fmtBytes(report.file_size_bytes)}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5">
                      {report.tags.map(tag => <Tag key={tag} label={tag} />)}
                    </div>
                  </div>
                </div>

                {/* Actions — same positions as original */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={loadReports}
                    className="p-2 rounded-lg text-[#475569] hover:text-white hover:bg-white/5 transition-all"
                    title="Refresh"
                  >
                    <RefreshCw size={14} />
                  </button>

                  {report.status === 'ready' && (
                    <button
                      onClick={() => handleDownload(report)}
                      disabled={downloading === report.id}
                      className="p-2 rounded-lg text-[#3b82f6] hover:bg-blue-500/10 transition-all disabled:opacity-50"
                      title="Download"
                    >
                      {downloading === report.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Download size={14} />}
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
