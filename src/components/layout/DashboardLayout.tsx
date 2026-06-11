import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import clsx from 'clsx';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const sidebarWidth = sidebarCollapsed ? 64 : 260;

  return (
    <div className="flex min-h-screen bg-[#0F1729] bg-grid">
      {/* ─── Mobile overlay ─────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar (desktop: always visible, mobile: drawer) ──── */}
      <div
        className={clsx(
          'lg:block transition-transform duration-300',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'fixed lg:fixed top-0 left-0 h-full z-30'
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
        />
      </div>

      {/* ─── Main content area ─────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <TopBar onMenuToggle={() => setMobileSidebarOpen(v => !v)} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* ─── Footer ──────────────────────────────────────────── */}
        <footer
          className="px-6 py-3 text-xs flex items-center justify-between border-t"
          style={{ color: '#334155', borderColor: 'rgba(255,255,255,0.04)' }}
        >
          <span>DataPulse BI Platform © 2025</span>
          <span className="flex items-center gap-1.5">
            <span className="status-dot online" />
            All systems operational
          </span>
        </footer>
      </div>
    </div>
  );
}
