import { Link } from 'react-router-dom';
import {
  Zap, BarChart3, Shield, Upload, FileText, ArrowRight,
  TrendingUp, Users, Activity, Globe
} from 'lucide-react';

const features = [
  { icon: <BarChart3 size={20} />, title: 'Analytics & Charts', desc: 'Interactive time-series, funnel, and distribution charts powered by Chart.js.' },
  { icon: <TrendingUp size={20} />, title: 'KPI Monitoring', desc: 'Real-time KPI tracking with trend indicators and threshold alerts.' },
  { icon: <Upload size={20} />, title: 'CSV / Excel Import', desc: 'Drag-and-drop file ingestion with automatic schema detection and validation.' },
  { icon: <FileText size={20} />, title: 'Exportable Reports', desc: 'Schedule and export reports in PDF, CSV, Excel, or JSON formats.' },
  { icon: <Shield size={20} />, title: 'Role-Based Access', desc: 'Admin, analyst, and viewer roles with granular permission controls.' },
  { icon: <Globe size={20} />, title: 'Multi-Region Data', desc: 'Segment and filter data by geography, channel, device, and more.' },
];

const stats = [
  { value: '48K+', label: 'Active Users', icon: <Users size={16} /> },
  { value: '$2.8M', label: 'Revenue Tracked', icon: <TrendingUp size={16} /> },
  { value: '312K', label: 'Sessions / Mo', icon: <Activity size={16} /> },
  { value: '99.9%', label: 'Uptime SLA', icon: <Zap size={16} /> },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a1020] bg-grid overflow-hidden">
      {/* ─── Navbar ──────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
          >
            <Zap size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">DataPulse</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-8 text-center">
        {/* Glow blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div className="absolute top-20 right-1/4 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}
          >
            <span className="status-dot online" />
            Now in beta — internship project build
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Business intelligence<br />
            <span className="text-gradient">that moves fast</span>
          </h1>

          <p className="text-lg text-[#64748b] max-w-2xl mx-auto leading-relaxed mb-10">
            A full-stack BI dashboard for tracking KPIs, visualising trends, importing data,
            and generating reports — built with React, TypeScript, and Node.js.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary flex items-center gap-2 px-6 py-3 text-base">
              Launch Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-ghost flex items-center gap-2 px-6 py-3 text-base">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="glass-card p-5 text-center">
              <div className="flex justify-center mb-2 text-[#3b82f6]">{stat.icon}</div>
              <div className="data-value text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-[#475569]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <p className="section-header">Platform Features</p>
          <h2 className="text-3xl font-bold text-white">Everything you need to run BI</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div
              key={f.title}
              className="glass-card p-5 hover:border-blue-500/30 transition-all duration-200 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-[#3b82f6] group-hover:scale-110 transition-transform"
                style={{ background: 'rgba(59,130,246,0.1)' }}
              >
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-8 pb-24 text-center">
        <div className="glass-card p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to explore?</h2>
          <p className="text-sm text-[#64748b] mb-8">
            Create a free account and start monitoring your business metrics in minutes.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] px-8 py-6 text-center text-xs text-[#334155]">
        DataPulse BI Platform — Built with React + TypeScript + Node.js
      </footer>
    </div>
  );
}
