import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { ArrowUpRight, RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockKPIs, mockTimeSeries, mockReports, mockImportRecords, formatDate, formatDateTime } from '@/data/mockData';
import { KPICard } from '@/components/ui/KPICard';
import { Card, StatusBadge, PageHeader, ProgressBar } from '@/components/ui/index';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111827',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#f0f4ff',
      bodyColor: '#94a3b8',
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#475569', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#475569', font: { size: 11 } },
    },
  },
  elements: { point: { radius: 3, hoverRadius: 6 } },
};

const revenueChartData = {
  labels: mockTimeSeries.map(d => d.date),
  datasets: [
    {
      label: 'Revenue',
      data: mockTimeSeries.map(d => d.revenue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
  ],
};

const usersChartData = {
  labels: mockTimeSeries.map(d => d.date),
  datasets: [
    {
      label: 'Active Users',
      data: mockTimeSeries.map(d => d.users),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
  ],
};

const recentReports = mockReports.slice(0, 4);
const recentImports = mockImportRecords.slice(0, 3);

// Quick-action items for the activity feed
const activityFeed = [
  { icon: <CheckCircle2 size={13} className="text-emerald-400" />, text: 'Q4 revenue report generated', time: '2h ago' },
  { icon: <AlertTriangle size={13} className="text-amber-400" />, text: 'Conversion rate below threshold', time: '5h ago' },
  { icon: <CheckCircle2 size={13} className="text-emerald-400" />, text: 'CRM export imported — 32K rows', time: '1d ago' },
  { icon: <Clock size={13} className="text-blue-400" />, text: 'Weekly KPI digest scheduled', time: '1d ago' },
  { icon: <AlertTriangle size={13} className="text-rose-400" />, text: 'marketing_spend_jan.xlsx failed', time: '2d ago' },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle={`Last updated: ${formatDateTime(new Date().toISOString())}`}
        actions={
          <button className="btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* ─── KPI Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockKPIs.map(kpi => (
          <div key={kpi.id} className="relative">
            <KPICard metric={kpi} />
          </div>
        ))}
      </div>

      {/* ─── Charts Row ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card
          title="Monthly Revenue"
          subtitle="12-month trend"
          action={
            <Link to="/dashboard/analytics" className="text-xs text-[#3b82f6] hover:text-[#60a5fa] flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          }
        >
          <div style={{ height: 220 }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </Card>

        <Card
          title="Active Users"
          subtitle="12-month trend"
          action={
            <Link to="/dashboard/analytics" className="text-xs text-[#3b82f6] hover:text-[#60a5fa] flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          }
        >
          <div style={{ height: 220 }}>
            <Line data={usersChartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* ─── Bottom Row ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Reports"
            noPad
            action={
              <Link to="/dashboard/reports" className="text-xs text-[#3b82f6] hover:text-[#60a5fa] flex items-center gap-1">
                All reports <ArrowUpRight size={12} />
              </Link>
            }
          >
            <div className="divide-y divide-white/[0.04]">
              {recentReports.map(report => (
                <div key={report.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{report.name}</p>
                    <p className="text-xs text-[#475569] mt-0.5">{formatDate(report.updatedAt)} · {report.format}</p>
                  </div>
                  <StatusBadge status={report.status} className="ml-4" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <Card title="Activity" subtitle="Recent events">
            <div className="space-y-3.5">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{item.text}</p>
                    <p className="text-[10px] text-[#334155] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick imports summary */}
          <Card title="Data Imports" subtitle="Recent uploads">
            <div className="space-y-3">
              {recentImports.map(imp => (
                <div key={imp.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-[#94a3b8] truncate max-w-[160px]">{imp.filename}</p>
                    <StatusBadge status={imp.status} />
                  </div>
                  {imp.status === 'success' && (
                    <ProgressBar value={100} color="#10b981" height={4} />
                  )}
                  {imp.status === 'processing' && (
                    <ProgressBar value={60} color="#3b82f6" height={4} />
                  )}
                  {imp.status === 'error' && (
                    <ProgressBar value={100} color="#f43f5e" height={4} />
                  )}
                </div>
              ))}
              <Link to="/dashboard/import" className="block text-xs text-[#3b82f6] hover:text-[#60a5fa] mt-2 transition-colors">
                Manage imports →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
