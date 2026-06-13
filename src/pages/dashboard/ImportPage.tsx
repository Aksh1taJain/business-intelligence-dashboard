import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import {
  Upload, FileSpreadsheet, AlertCircle, CheckCircle2,
  RotateCcw, Eye, ChevronDown, ChevronUp, X, RefreshCw,
} from 'lucide-react';
import { importService, type ImportRecord, type ImportPreview } from '@/services/importService';
import { ApiRequestError } from '@/services/api';
import { Card, StatusBadge, PageHeader } from '@/components/ui/index';
import { PreviewTable } from '@/components/ui/PreviewTable';
import clsx from 'clsx';

type DropState = 'idle' | 'hover' | 'uploading' | 'done' | 'error';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

// ─── DropZone ──────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  dropState: DropState;
  selectedFile: File | null;
  uploadProgress: number;
  uploadError: string | null;
  uploadResult: ImportRecord | null;
  onReset: () => void;
}

function DropZone({
  onFileSelected, dropState, selectedFile,
  uploadProgress, uploadError, uploadResult, onReset,
}: DropZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  if (dropState === 'idle' || dropState === 'hover') {
    return (
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-xl py-16 px-8 text-center cursor-pointer transition-all duration-200',
          dragging
            ? 'border-blue-500 bg-blue-500/5'
            : 'border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]',
        )}
      >
        <input
          ref={fileRef} type="file" accept=".csv"
          onChange={handleChange} className="hidden"
        />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(59,130,246,0.1)' }}
        >
          <Upload size={28} className="text-[#3b82f6]" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">
          {dragging ? 'Drop to upload' : 'Drop your CSV here'}
        </h3>
        <p className="text-sm text-[#64748b] mb-5">
          or <span className="text-[#3b82f6]">browse</span> to choose a file
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-[#334155]">
          <span className="flex items-center gap-1.5"><FileSpreadsheet size={13} /> CSV only</span>
          <span>Max 10 MB</span>
        </div>
      </div>
    );
  }

  if (dropState === 'uploading') {
    return (
      <div className="py-12 px-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(59,130,246,0.1)' }}>
          <FileSpreadsheet size={28} className="text-[#3b82f6]" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">{selectedFile?.name}</h3>
        <p className="text-xs text-[#475569] mb-6">{selectedFile ? fmtBytes(selectedFile.size) : ''}</p>
        <div className="max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-[#64748b] mb-2">
            <span>Uploading & parsing…</span>
            <span className="data-value">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (dropState === 'error') {
    return (
      <div className="py-12 px-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(244,63,94,0.1)' }}>
          <AlertCircle size={28} className="text-rose-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">Upload failed</h3>
        <p className="text-sm text-rose-400 mb-6 max-w-xs mx-auto">{uploadError}</p>
        <button onClick={onReset} className="btn-ghost flex items-center gap-2 mx-auto text-xs">
          <RotateCcw size={13} /> Try again
        </button>
      </div>
    );
  }

  // done
  return (
    <div className="py-10 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(16,185,129,0.1)' }}>
        <CheckCircle2 size={28} className="text-emerald-400" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">Import successful</h3>
      {uploadResult && (
        <p className="text-sm text-[#64748b] mb-1">
          <span className="data-value text-white">{uploadResult.rows_imported.toLocaleString()}</span> rows ·{' '}
          <span className="data-value text-white">{uploadResult.columns_found}</span> columns
        </p>
      )}
      <p className="text-xs text-[#475569] mb-6">{selectedFile?.name}</p>
      <button onClick={onReset} className="btn-ghost flex items-center gap-2 mx-auto text-xs">
        <Upload size={13} /> Upload another file
      </button>
    </div>
  );
}

// ─── ImportPage ────────────────────────────────────────────────────────────────

export function ImportPage() {
  const [dropState,       setDropState]       = useState<DropState>('idle');
  const [selectedFile,    setSelectedFile]    = useState<File | null>(null);
  const [uploadProgress,  setUploadProgress]  = useState(0);
  const [uploadError,     setUploadError]     = useState<string | null>(null);
  const [uploadResult,    setUploadResult]    = useState<ImportRecord | null>(null);

  const [history,         setHistory]         = useState<ImportRecord[]>([]);
  const [historyLoading,  setHistoryLoading]  = useState(true);
  const [historyError,    setHistoryError]    = useState<string | null>(null);

  const [previewId,       setPreviewId]       = useState<string | null>(null);
  const [preview,         setPreview]         = useState<ImportPreview | null>(null);
  const [previewLoading,  setPreviewLoading]  = useState(false);

  // ── Load history on mount ─────────────────────────────────────────────────
  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const records = await importService.getHistory();
      setHistory(records);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  // ── Handle file upload ────────────────────────────────────────────────────
  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setDropState('uploading');
    setUploadError(null);
    setUploadProgress(0);

    // Animate progress bar up to 80% during upload, then jump to 100 on success
    const interval = setInterval(() => {
      setUploadProgress(p => (p >= 80 ? 80 : p + Math.random() * 15));
    }, 200);

    try {
      const result = await importService.upload(file);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadResult(result.import);
      setDropState('done');
      // Reload history so the new import appears immediately
      loadHistory();
    } catch (err) {
      clearInterval(interval);
      const msg = err instanceof ApiRequestError ? err.message : 'Upload failed. Please try again.';
      setUploadError(msg);
      setDropState('error');
    }
  };

  const handleReset = () => {
    setDropState('idle');
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setUploadResult(null);
  };

  // ── Toggle preview panel ──────────────────────────────────────────────────
  const handleTogglePreview = async (importId: string) => {
    if (previewId === importId) {
      setPreviewId(null);
      setPreview(null);
      return;
    }
    setPreviewId(importId);
    setPreview(null);
    setPreviewLoading(true);
    try {
      const data = await importService.getPreview(importId);
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Import"
        subtitle="Upload CSV files to ingest data into the platform"
      />

      {/* ─── Drop Zone ──────────────────────────────────────────────── */}
      <Card>
        <DropZone
          onFileSelected={handleFileSelected}
          dropState={dropState}
          selectedFile={selectedFile}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          uploadResult={uploadResult}
          onReset={handleReset}
        />
      </Card>

      {/* ─── Guidelines ────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            icon: <CheckCircle2 size={16} className="text-emerald-400" />,
            title: 'Supported Formats',
            desc:  'CSV (UTF-8 or UTF-8 BOM). First row must be column headers.',
          },
          {
            icon: <AlertCircle size={16} className="text-amber-400" />,
            title: 'Schema Requirements',
            desc:  'Header names become column keys — avoid duplicates and special characters.',
          },
          {
            icon: <X size={16} className="text-rose-400" />,
            title: 'Size Limit',
            desc:  'Maximum 10 MB per file. Split larger files before uploading.',
          },
        ].map(item => (
          <div key={item.title} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <span className="text-xs font-semibold text-white">{item.title}</span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ─── Import History ────────────────────────────────────────── */}
      <Card
        title="Import History"
        subtitle="All your uploaded files"
        noPad
        action={
          <button
            onClick={loadHistory}
            disabled={historyLoading}
            className="text-[#475569] hover:text-white transition-colors disabled:opacity-40"
            title="Refresh history"
          >
            <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} />
          </button>
        }
      >
        {historyError && (
          <div className="px-5 py-4 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={13} /> {historyError}
          </div>
        )}

        {historyLoading && !historyError && (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-48" />
                  <div className="h-2 bg-white/5 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!historyLoading && !historyError && history.length === 0 && (
          <div className="py-14 text-center">
            <FileSpreadsheet size={28} className="text-[#334155] mx-auto mb-3" />
            <p className="text-sm text-[#475569]">No imports yet — upload your first CSV above.</p>
          </div>
        )}

        {!historyLoading && history.length > 0 && (
          <div className="divide-y divide-white/[0.04]">
            {history.map(record => (
              <div key={record.id}>
                {/* Row */}
                <div className="flex items-start gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.08)' }}
                  >
                    <FileSpreadsheet size={16} className="text-[#3b82f6]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-medium text-white truncate max-w-xs">
                        {record.filename}
                      </p>
                      <StatusBadge status={record.status} />
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
                      >
                        {record.file_type}
                      </span>
                    </div>

                    {record.error_message ? (
                      <p className="text-xs text-rose-400 mt-1">{record.error_message}</p>
                    ) : (
                      <div className="flex items-center gap-4 mt-1 text-xs text-[#475569] flex-wrap">
                        {record.rows_imported > 0 && (
                          <>
                            <span className="data-value">{record.rows_imported.toLocaleString()} rows</span>
                            <span>{record.columns_found} columns</span>
                          </>
                        )}
                        <span>{fmtBytes(record.file_size_bytes)}</span>
                        {record.dataset_name && (
                          <span className="text-[#3b82f6]">→ {record.dataset_name}</span>
                        )}
                      </div>
                    )}
                    <p className="text-[11px] text-[#334155] mt-1">{fmtDate(record.created_at)}</p>
                  </div>

                  {/* Preview toggle */}
                  {record.status === 'success' && (
                    <button
                      onClick={() => handleTogglePreview(record.id)}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors flex-shrink-0',
                        previewId === record.id
                          ? 'text-blue-400 bg-blue-400/10'
                          : 'text-[#475569] hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100',
                      )}
                    >
                      <Eye size={13} />
                      Preview
                      {previewId === record.id
                        ? <ChevronUp size={12} />
                        : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>

                {/* Preview panel */}
                {previewId === record.id && (
                  <div
                    className="px-5 pb-5 animate-fade-in"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}
                  >
                    <div className="pt-4">
                      {previewLoading ? (
                        <div className="flex items-center gap-2 text-xs text-[#475569] py-4">
                          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
                          Loading preview…
                        </div>
                      ) : preview ? (
                        <PreviewTable
                          columns={preview.columns}
                          rows={preview.rows}
                          totalRows={preview.total_rows}
                          previewing={preview.previewing}
                        />
                      ) : (
                        <p className="text-xs text-rose-400 py-4">Failed to load preview.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
