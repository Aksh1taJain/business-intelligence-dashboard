import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import type { ReportStatus, ImportStatus } from '@/types';
import clsx from 'clsx';

// ─── StatusBadge ─────────────────────────────────────────────────────────────
type AnyStatus = ReportStatus | ImportStatus;

const statusConfig: Record<AnyStatus, {
  label: string;
  icon: React.ReactNode;
  className: string;
}> = {
  ready:      { label: 'Ready',      icon: <CheckCircle2 size={11} />, className: 'badge-green' },
  success:    { label: 'Success',    icon: <CheckCircle2 size={11} />, className: 'badge-green' },
  processing: { label: 'Processing', icon: <Loader2 size={11} className="animate-spin" />, className: 'badge-blue' },
  pending:    { label: 'Pending',    icon: <Clock size={11} />,        className: 'badge-amber' },
  scheduled:  { label: 'Scheduled',  icon: <Calendar size={11} />,     className: 'badge-amber' },
  failed:     { label: 'Failed',     icon: <AlertCircle size={11} />,  className: 'badge-red' },
  error:      { label: 'Error',      icon: <AlertCircle size={11} />,  className: 'badge-red' },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={clsx('badge', config.className, className)}>
      {config.icon}
      {config.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPad?: boolean;
}

export function Card({ children, className, title, subtitle, action, noPad }: CardProps) {
  return (
    <div className={clsx('glass-card overflow-hidden', className)}>
      {(title || action) && (
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div>
            {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-[#64748b] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={clsx(!noPad && 'p-5')}>{children}</div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-[#3b82f6]"
        style={{ background: 'rgba(59,130,246,0.1)' }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-xs text-[#64748b] max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;   // 0–100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ value, color = '#3b82f6', height = 6, showLabel = false }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs data-value text-[#64748b] w-8 text-right">{value}%</span>
      )}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <hr className={clsx('divider my-4', className)} />;
}

// ─── Tag ─────────────────────────────────────────────────────────────────────
export function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium"
      style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
    >
      {label}
    </span>
  );
}
