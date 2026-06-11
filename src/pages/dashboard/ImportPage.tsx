import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, RotateCcw } from 'lucide-react';
import { mockImportRecords, formatDateTime } from '@/data/mockData';
import { Card, StatusBadge, PageHeader } from '@/components/ui/index';
import clsx from 'clsx';

type DropState = 'idle' | 'hover' | 'uploading' | 'done';

export function ImportPage() {
  const [dropState, setDropState] = useState<DropState>('idle');
  const [fakeProgress, setFakeProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const startFakeUpload = (file: File) => {
    setSelectedFile(file);
    setDropState('uploading');
    setFakeProgress(0);

    const interval = setInterval(() => {
      setFakeProgress(p => {
        if (p >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setDropState('done');
            setFakeProgress(100);
          }, 400);
          return p;
        }
        return p + Math.random() * 18;
      });
    }, 200);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropState('idle');
    const file = e.dataTransfer.files[0];
    if (file) startFakeUpload(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startFakeUpload(file);
  };

  const resetUpload = () => {
    setDropState('idle');
    setFakeProgress(0);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Import"
        subtitle="Upload CSV or Excel files to ingest data into the platform"
      />

      {/* ─── Drop Zone ──────────────────────────────────────────── */}
      <Card>
        {dropState === 'idle' || dropState === 'hover' ? (
          <div
            onDragEnter={() => setDropState('hover')}
            onDragLeave={() => setDropState('idle')}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={clsx(
              'border-2 border-dashed rounded-xl py-16 px-8 text-center cursor-pointer transition-all duration-200',
              dropState === 'hover'
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]'
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(59,130,246,0.1)' }}
            >
              <Upload size={28} className="text-[#3b82f6]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              {dropState === 'hover' ? 'Drop to upload' : 'Drop your file here'}
            </h3>
            <p className="text-sm text-[#64748b] mb-5">
              or <span className="text-[#3b82f6]">browse</span> to choose a file
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-[#334155]">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet size={13} /> CSV
              </span>
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet size={13} /> Excel (.xlsx / .xls)
              </span>
              <span>Max 50 MB</span>
            </div>
          </div>
        ) : dropState === 'uploading' ? (
          <div className="py-12 px-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(59,130,246,0.1)' }}
            >
              <FileSpreadsheet size={28} className="text-[#3b82f6]" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{selectedFile?.name}</h3>
            <p className="text-xs text-[#475569] mb-6">
              {selectedFile ? formatFileSize(selectedFile.size) : ''}
            </p>

            {/* Progress bar */}
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-[#64748b] mb-2">
                <span>Uploading…</span>
                <span className="data-value">{Math.round(fakeProgress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${fakeProgress}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* done */
          <div className="py-12 px-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(16,185,129,0.1)' }}
            >
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Upload successful!</h3>
            <p className="text-sm text-[#64748b] mb-6">{selectedFile?.name} has been queued for processing.</p>
            <button onClick={resetUpload} className="btn-ghost flex items-center gap-2 mx-auto text-xs">
              <RotateCcw size={13} /> Upload another file
            </button>
          </div>
        )}
      </Card>

      {/* ─── Guidelines ─────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: <CheckCircle2 size={16} className="text-emerald-400" />, title: 'Supported Formats', desc: 'CSV (UTF-8), Excel 97-2003 (.xls), and Excel 2007+ (.xlsx).' },
          { icon: <AlertCircle size={16} className="text-amber-400" />, title: 'Schema Requirements', desc: 'First row must be headers. Avoid merged cells and special characters in column names.' },
          { icon: <X size={16} className="text-rose-400" />, title: 'Common Errors', desc: 'Schema mismatches, encoding issues, and missing required fields are the most common causes of failure.' },
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

      {/* ─── Import History ─────────────────────────────────────── */}
      <Card title="Import History" subtitle="Previous file uploads and their status" noPad>
        <div className="divide-y divide-white/[0.04]">
          {mockImportRecords.map(record => (
            <div key={record.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(59,130,246,0.08)' }}
                >
                  <FileSpreadsheet size={16} className="text-[#3b82f6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-medium text-white truncate">{record.filename}</p>
                    <StatusBadge status={record.status} />
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
                    >
                      {record.fileType}
                    </span>
                  </div>

                  {record.errorMessage ? (
                    <p className="text-xs text-rose-400 mt-1">{record.errorMessage}</p>
                  ) : (
                    <div className="flex items-center gap-4 mt-1 text-xs text-[#475569]">
                      {record.rows > 0 && (
                        <>
                          <span className="data-value">{record.rows.toLocaleString()} rows</span>
                          <span>{record.columns} columns</span>
                        </>
                      )}
                      <span>{record.fileSize}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-[#334155] mt-1">
                    {formatDateTime(record.importedAt)} · by {record.importedBy}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {record.status === 'error' && (
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-amber-400/10 transition-colors"
                    >
                      <RotateCcw size={12} /> Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
