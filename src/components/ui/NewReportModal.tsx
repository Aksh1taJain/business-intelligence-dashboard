/**
 * src/components/ui/NewReportModal.tsx
 *
 * Modal opened by the "New Report" button on ReportsPage.
 * Lets the user pick a dataset, name the report, choose format, then generate.
 */

import { useState, useEffect, type FormEvent } from 'react';
import { X, FileText, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { reportService, type ApiDataset, type ReportFormat, type CreateReportPayload } from '@/services/reportService';
import { ApiRequestError } from '@/services/api';
import clsx from 'clsx';

interface NewReportModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;   // called after successful generation to refresh the list
}

const FORMATS: { value: ReportFormat; label: string; desc: string; color: string }[] = [
  { value: 'PDF',   label: 'PDF',   desc: 'Formatted report with header & table',  color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  { value: 'Excel', label: 'Excel', desc: 'Multi-sheet workbook with auto-filter',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { value: 'CSV',   label: 'CSV',   desc: 'Raw data with BOM for Excel compat',     color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
];

function fmtRows(n: number) { return n.toLocaleString() + ' row' + (n !== 1 ? 's' : ''); }

export function NewReportModal({ open, onClose, onCreated }: NewReportModalProps) {
  const [datasets,        setDatasets]        = useState<ApiDataset[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [datasetId,   setDatasetId]   = useState('');
  const [format,      setFormat]      = useState<ReportFormat>('PDF');

  const [generating, setGenerating]   = useState(false);
  const [error,      setError]        = useState<string | null>(null);

  // Load datasets when the modal opens
  useEffect(() => {
    if (!open) return;
    setDatasetsLoading(true);
    setError(null);
    reportService.listDatasets()
      .then(ds => {
        setDatasets(ds);
        if (ds.length > 0 && ds[0]) setDatasetId(ds[0].id);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load datasets.'))
      .finally(() => setDatasetsLoading(false));
  }, [open]);

  const selectedDataset = datasets.find(d => d.id === datasetId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !datasetId || !format) return;

    setGenerating(true);
    setError(null);

    const payload: CreateReportPayload = {
      name:        name.trim(),
      description: description.trim(),
      format,
      dataset_id:  datasetId,
      tags:        [format.toLowerCase(), selectedDataset?.name ?? ''].filter(Boolean),
    };

    try {
      await reportService.create(payload);
      handleClose();
      onCreated();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Generation failed. Please try again.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    if (generating) return;
    setName('');
    setDescription('');
    setFormat('PDF');
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl animate-fade-in"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <FileText size={15} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">New Report</h2>
              <p className="text-[11px] text-[#475569]">Generate from your imported datasets</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={generating}
            className="text-[#475569] hover:text-white transition-colors disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div
              className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-xs text-rose-400"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Report name */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Report name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Q4 Sales Summary"
              required
              className="input-field text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
              Description <span className="text-[#334155]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of what this report covers…"
              rows={2}
              className="input-field text-sm resize-none"
            />
          </div>

          {/* Dataset selector */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Source dataset</label>
            {datasetsLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#475569] py-2">
                <Loader2 size={13} className="animate-spin" /> Loading datasets…
              </div>
            ) : datasets.length === 0 ? (
              <div className="text-xs text-amber-400 py-2">
                No datasets found. Import a CSV file first.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={datasetId}
                  onChange={e => setDatasetId(e.target.value)}
                  required
                  className="input-field text-sm appearance-none pr-8"
                >
                  {datasets.map(ds => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} — {fmtRows(ds.row_count)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
              </div>
            )}
            {selectedDataset && (
              <p className="text-[11px] text-[#334155] mt-1.5">
                {selectedDataset.row_count.toLocaleString()} rows · {selectedDataset.column_count} columns
              </p>
            )}
          </div>

          {/* Format picker */}
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-2">Export format</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-150',
                    format === f.value
                      ? clsx(f.color, 'border-current')
                      : 'text-[#475569] border-white/[0.07] hover:border-white/[0.12] hover:text-white',
                  )}
                  style={format !== f.value ? { background: 'rgba(255,255,255,0.03)' } : undefined}
                >
                  <span className="text-sm font-bold">{f.label}</span>
                  <span className="text-[10px] leading-tight opacity-70">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={generating || !name.trim() || !datasetId || datasetsLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating…
                </>
              ) : (
                `Generate ${format}`
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={generating}
              className="btn-ghost px-4 py-2.5 text-sm disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
