import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockNotifications, mockKPIs, formatNumber, formatCurrency } from '@/data/mockData';
import clsx from 'clsx';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Overview', subtitle: 'Your business at a glance' },
  '/dashboard/analytics': { title: 'Analytics', subtitle: 'Detailed performance metrics' },
  '/dashboard/reports': { title: 'Reports', subtitle: 'Generated & scheduled reports' },
  '/dashboard/import': { title: 'Data Import', subtitle: 'Upload CSV & Excel files' },
  '/dashboard/profile': { title: 'Profile', subtitle: 'Manage your account details' },
  '/dashboard/settings': { title: 'Settings', subtitle: 'Platform configuration' },
};

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const routeInfo = routeTitles[location.pathname] ?? { title: 'Dashboard', subtitle: '' };
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  // Pick 3 KPIs for the pulse bar
  const pulseKPIs = mockKPIs.slice(0, 3);

  const formatKPIValue = (kpi: typeof mockKPIs[0]) => {
    const val = typeof kpi.value === 'number' ? kpi.value : parseFloat(kpi.value);
    if (kpi.prefix === '$') return formatCurrency(val);
    if (kpi.unit === '%') return `${kpi.value}%`;
    return formatNumber(val);
  };

  return (
    <header
      className="sticky top-0 z-20 border-b"
      style={{
        background: 'rgba(10, 16, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* ─── KPI Pulse Bar ──────────────────────────────────────── */}
      <div
        className="hidden md:flex items-center gap-6 px-6 py-1.5 border-b text-xs"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <span className="text-[#475569] font-medium uppercase tracking-widest text-[10px]">
          Live KPIs
        </span>
        {pulseKPIs.map(kpi => (
          <div key={kpi.id} className="flex items-center gap-2">
            <span className="text-[#64748b]">{kpi.label}</span>
            <span className="data-value text-white font-medium">{formatKPIValue(kpi)}</span>
            <span
              className={clsx(
                'flex items-center gap-0.5 font-medium',
                kpi.trend === 'up' ? 'text-emerald-400' : kpi.trend === 'down' ? 'text-rose-400' : 'text-slate-400'
              )}
            >
              {kpi.trend === 'up' ? <TrendingUp size={11} /> : kpi.trend === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
              {Math.abs(kpi.change)}%
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="status-dot online" />
          <span className="text-[#475569]">Live</span>
        </div>
      </div>

      {/* ─── Main Top Bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-3.5">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-[#64748b] hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white leading-tight">{routeInfo.title}</h1>
          <p className="text-[11px] text-[#475569] hidden sm:block">{routeInfo.subtitle}</p>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-56 transition-all focus-within:w-72"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Search size={14} className="text-[#475569] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white placeholder-[#475569] text-xs w-full"
          />
          <kbd className="text-[10px] text-[#334155] bg-white/5 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#64748b] hover:text-white hover:bg-white/5 transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f43f5e]"
                style={{ boxShadow: '0 0 6px rgba(244,63,94,0.7)' }}
              />
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="badge badge-blue">{unreadCount} new</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {mockNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={clsx(
                      'px-4 py-3 border-b hover:bg-white/[0.03] transition-colors',
                      !notif.read && 'bg-blue-500/[0.05]'
                    )}
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={clsx('mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0', {
                        'bg-blue-400': notif.type === 'info',
                        'bg-emerald-400': notif.type === 'success',
                        'bg-amber-400': notif.type === 'warning',
                        'bg-rose-400': notif.type === 'error',
                      })} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">{notif.title}</p>
                        <p className="text-[11px] text-[#64748b] mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center">
                <button className="text-xs text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
