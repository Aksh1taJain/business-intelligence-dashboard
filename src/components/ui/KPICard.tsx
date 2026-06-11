import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  Activity,
  BarChart2,
  ShoppingCart,
} from 'lucide-react';
import type { KPIMetric } from '@/types';
import { formatNumber, formatCurrency } from '@/data/mockData';
import clsx from 'clsx';

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign size={18} />,
  Users: <Users size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  Activity: <Activity size={18} />,
  BarChart2: <BarChart2 size={18} />,
  ShoppingCart: <ShoppingCart size={18} />,
};

const colorMap: Record<KPIMetric['color'], { icon: string; glow: string; ring: string }> = {
  blue:    { icon: '#3b82f6', glow: 'rgba(59,130,246,0.2)',  ring: 'rgba(59,130,246,0.15)' },
  cyan:    { icon: '#06b6d4', glow: 'rgba(6,182,212,0.2)',   ring: 'rgba(6,182,212,0.15)'  },
  purple:  { icon: '#8b5cf6', glow: 'rgba(139,92,246,0.2)',  ring: 'rgba(139,92,246,0.15)' },
  emerald: { icon: '#10b981', glow: 'rgba(16,185,129,0.2)',  ring: 'rgba(16,185,129,0.15)' },
  amber:   { icon: '#f59e0b', glow: 'rgba(245,158,11,0.2)',  ring: 'rgba(245,158,11,0.15)' },
  rose:    { icon: '#f43f5e', glow: 'rgba(244,63,94,0.2)',   ring: 'rgba(244,63,94,0.15)'  },
};

interface KPICardProps {
  metric: KPIMetric;
  loading?: boolean;
}

export function KPICard({ metric, loading = false }: KPICardProps) {
  const colors = colorMap[metric.color];

  const formatValue = (): string => {
    const val = typeof metric.value === 'number' ? metric.value : parseFloat(metric.value);
    if (metric.prefix === '$') return formatCurrency(val);
    if (metric.unit === '%') return `${metric.value}${metric.unit}`;
    return formatNumber(val);
  };

  if (loading) {
    return (
      <div className="kpi-card animate-pulse">
        <div className="h-4 bg-white/10 rounded w-24 mb-4" />
        <div className="h-8 bg-white/10 rounded w-32 mb-3" />
        <div className="h-3 bg-white/10 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="kpi-card group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
          {metric.label}
        </p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
          style={{
            background: colors.ring,
            color: colors.icon,
            boxShadow: `0 0 16px ${colors.glow}`,
          }}
        >
          {iconMap[metric.icon]}
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <span className="data-value text-2xl font-bold text-white tracking-tight">
          {formatValue()}
        </span>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5">
        <span
          className={clsx(
            'flex items-center gap-1 text-xs font-semibold',
            metric.trend === 'up'   ? 'text-emerald-400' :
            metric.trend === 'down' ? 'text-rose-400'    : 'text-slate-400'
          )}
        >
          {metric.trend === 'up'      ? <TrendingUp size={13} />  :
           metric.trend === 'down'    ? <TrendingDown size={13} /> :
           <Minus size={13} />}
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </span>
        <span className="text-xs text-[#475569]">{metric.changeLabel}</span>
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full rounded-b-xl transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${colors.icon}, transparent)` }}
      />
    </div>
  );
}
