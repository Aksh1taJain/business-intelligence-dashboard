import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Upload,
  User,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';

interface SidebarNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const mainNavItems: SidebarNavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 size={18} /> },
  { label: 'Reports', path: '/dashboard/reports', icon: <FileText size={18} />, badge: '3' },
  { label: 'Data Import', path: '/dashboard/import', icon: <Upload size={18} /> },
];

const accountNavItems: SidebarNavItem[] = [
  { label: 'Profile', path: '/dashboard/profile', icon: <User size={18} /> },
  { label: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} /> },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-full flex flex-col sidebar-shadow transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-[260px]'
      )}
      style={{ background: 'rgba(10, 16, 32, 0.95)', backdropFilter: 'blur(20px)' }}
    >
      {/* ─── Logo ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center glow-blue"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
        >
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold tracking-tight text-white">DataPulse</span>
            <span className="block text-[10px] text-[#64748b] font-medium uppercase tracking-widest">
              BI Platform
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-[#475569] hover:text-white transition-colors"
        >
          <ChevronRight
            size={16}
            className={clsx('transition-transform duration-300', collapsed ? '' : 'rotate-180')}
          />
        </button>
      </div>

      {/* ─── Main Nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="section-header px-3 mb-2">Main Menu</p>
        )}
        {mainNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              clsx('nav-item', isActive && 'active', collapsed && 'justify-center px-0')
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="badge badge-blue text-[10px] px-1.5 py-0.5">{item.badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4">
          {!collapsed && <p className="section-header px-3 mb-2">Account</p>}
          {accountNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx('nav-item', isActive && 'active', collapsed && 'justify-center px-0')
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ─── User Footer ──────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="relative flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              <span className="status-dot online absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#0a1020]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#64748b] truncate capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#475569] hover:text-[#f43f5e] transition-colors p-1 rounded"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center text-[#475569] hover:text-[#f43f5e] transition-colors p-2 rounded-lg"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
