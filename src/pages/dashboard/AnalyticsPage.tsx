import { useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { mockAnalyticsData } from '@/data/mockData';
import { Card, PageHeader, ProgressBar } from '@/components/ui/index';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
);

type TimeRange = '7d' | '30d' | '90d' | '12m';

const tooltipDefaults = {
  backgroundColor: '#111827',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  titleColor: '#f0f4ff',
  bodyColor: '#94a3b8',
  padding: 12,
};

const channelColors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('12m');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'users' | 'sessions' | 'conversions'>('revenue');

  const metricConfig = {
    revenue:     { label: 'Revenue',     color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    users:       { label: 'Active Users', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
    sessions:    { label: 'Sessions',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
    conversions: { label: 'Conversions', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  };

  const cfg = metricConfig[activeMetric];

  const lineData = {
    labels: mockAnalyticsData.timeSeries.map(d => d.date),
    datasets: [{
      label: cfg.label,
      data: mockAnalyticsData.timeSeries.map(d => d[activeMetric]),
      borderColor: cfg.color,
      backgroundColor: cfg.bg,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }],
  };

  const barData = {
    labels: mockAnalyticsData.topChannels.map(c => c.label),
    datasets: [{
      label: 'Traffic Share (%)',
      data: mockAnalyticsData.topChannels.map(c => c.value),
      backgroundColor: channelColors.map(c => c + '99'),
      borderColor: channelColors,
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const doughnutData = {
    labels: mockAnalyticsData.deviceBreakdown.map(d => d.label),
    datasets: [{
      data: mockAnalyticsData.deviceBreakdown.map(d => d.value),
      backgroundColor: ['#3b82f6', '#06b6d4', '#8b5cf6'],
      borderColor: '#0f1729',
      borderWidth: 3,
    }],
  };

  const regionDoughnutData = {
    labels: mockAnalyticsData.regionData.map(d => d.label),
    datasets: [{
      data: mockAnalyticsData.regionData.map(d => d.value),
      backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b'],
      borderColor: '#0f1729',
      borderWidth: 3,
    }],
  };

  const baseChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipDefaults },
  };

  const axisChartOpts = {
    ...baseChartOpts,
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
    },
    elements: { point: { radius: 3, hoverRadius: 6 } },
  };

  const doughnutOpts = {
    ...baseChartOpts,
    cutout: '68%',
    plugins: {
      ...baseChartOpts.plugins,
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: '#64748b', padding: 16, font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Detailed performance breakdown across all channels"
        actions={
          <div
            className="flex items-center rounded-lg p-1 gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {(['7d', '30d', '90d', '12m'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-[#64748b] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      {/* ─── Metric Selector + Line Chart ─────────────────────── */}
      <Card
        title="Performance Over Time"
        subtitle={`Viewing: ${cfg.label}`}
        action={
          <div className="flex gap-1">
            {(Object.keys(metricConfig) as typeof activeMetric[]).map(key => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeMetric === key
                    ? 'text-white'
                    : 'text-[#475569] hover:text-white'
                }`}
                style={activeMetric === key ? { background: metricConfig[key].color + '33', color: metricConfig[key].color } : {}}
              >
                {metricConfig[key].label}
              </button>
            ))}
          </div>
        }
      >
        <div style={{ height: 260 }}>
          <Line data={lineData} options={axisChartOpts} />
        </div>
      </Card>

      {/* ─── Bottom Charts Grid ────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Traffic by Channel */}
        <Card title="Traffic by Channel" subtitle="Share of total sessions (%)">
          <div style={{ height: 220 }}>
            <Bar data={barData} options={axisChartOpts} />
          </div>
        </Card>

        {/* Device Breakdown */}
        <Card title="Device Breakdown" subtitle="Session share by device type">
          <div style={{ height: 220 }}>
            <Doughnut data={doughnutData} options={doughnutOpts} />
          </div>
        </Card>

        {/* Region Distribution */}
        <Card title="Regional Distribution" subtitle="Traffic share by geography">
          <div style={{ height: 220 }}>
            <Doughnut data={regionDoughnutData} options={doughnutOpts} />
          </div>
        </Card>

        {/* Channel Breakdown Table */}
        <Card title="Channel Details" subtitle="Detailed channel performance">
          <div className="space-y-4">
            {mockAnalyticsData.topChannels.map((ch, i) => (
              <div key={ch.label}>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: channelColors[i] }}
                    />
                    <span className="text-[#94a3b8]">{ch.label}</span>
                  </div>
                  <span className="data-value font-medium text-white">{ch.value}%</span>
                </div>
                <ProgressBar value={ch.value} color={channelColors[i]} height={5} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
