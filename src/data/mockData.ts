import type {
  User,
  KPIMetric,
  TimeSeriesDataPoint,
  AnalyticsData,
  Report,
  ImportRecord,
  Notification,
} from '@/types';

// ─── Mock User ────────────────────────────────────────────────────────────────
export const mockUser: User = {
  id: 'usr_001',
  name: 'Alex Rivera',
  email: 'alex.rivera@company.com',
  role: 'admin',
  department: 'Business Intelligence',
  joinedAt: '2023-08-15',
};

// ─── KPI Metrics ─────────────────────────────────────────────────────────────
export const mockKPIs: KPIMetric[] = [
  {
    id: 'kpi_revenue',
    label: 'Total Revenue',
    value: 2847500,
    change: 12.4,
    changeLabel: 'vs last month',
    prefix: '$',
    trend: 'up',
    color: 'blue',
    icon: 'DollarSign',
  },
  {
    id: 'kpi_users',
    label: 'Active Users',
    value: 48320,
    change: 8.7,
    changeLabel: 'vs last month',
    trend: 'up',
    color: 'cyan',
    icon: 'Users',
  },
  {
    id: 'kpi_conversion',
    label: 'Conversion Rate',
    value: '3.24',
    change: -0.6,
    changeLabel: 'vs last month',
    unit: '%',
    trend: 'down',
    color: 'amber',
    icon: 'TrendingUp',
  },
  {
    id: 'kpi_sessions',
    label: 'Total Sessions',
    value: 312800,
    change: 15.2,
    changeLabel: 'vs last month',
    trend: 'up',
    color: 'purple',
    icon: 'Activity',
  },
  {
    id: 'kpi_bounce',
    label: 'Bounce Rate',
    value: '38.5',
    change: -3.1,
    changeLabel: 'vs last month',
    unit: '%',
    trend: 'up', // Lower bounce rate is better
    color: 'emerald',
    icon: 'BarChart2',
  },
  {
    id: 'kpi_avg_order',
    label: 'Avg. Order Value',
    value: 127.4,
    change: 4.2,
    changeLabel: 'vs last month',
    prefix: '$',
    trend: 'up',
    color: 'rose',
    icon: 'ShoppingCart',
  },
];

// ─── Time Series ──────────────────────────────────────────────────────────────
export const mockTimeSeries: TimeSeriesDataPoint[] = [
  { date: 'Jan', revenue: 185000, users: 28400, sessions: 198000, conversions: 6420 },
  { date: 'Feb', revenue: 201000, users: 31200, sessions: 214000, conversions: 6930 },
  { date: 'Mar', revenue: 198500, users: 29800, sessions: 208000, conversions: 6810 },
  { date: 'Apr', revenue: 224000, users: 34100, sessions: 231000, conversions: 7480 },
  { date: 'May', revenue: 218000, users: 36700, sessions: 247000, conversions: 8010 },
  { date: 'Jun', revenue: 251000, users: 39200, sessions: 265000, conversions: 8590 },
  { date: 'Jul', revenue: 268000, users: 41500, sessions: 278000, conversions: 9010 },
  { date: 'Aug', revenue: 245000, users: 38900, sessions: 261000, conversions: 8470 },
  { date: 'Sep', revenue: 271000, users: 43100, sessions: 289000, conversions: 9370 },
  { date: 'Oct', revenue: 289000, users: 45600, sessions: 301000, conversions: 9760 },
  { date: 'Nov', revenue: 312000, users: 47200, sessions: 316000, conversions: 10240 },
  { date: 'Dec', revenue: 347500, users: 48320, sessions: 312800, conversions: 11270 },
];

// ─── Analytics Data ───────────────────────────────────────────────────────────
export const mockAnalyticsData: AnalyticsData = {
  timeSeries: mockTimeSeries,
  topChannels: [
    { label: 'Organic Search', value: 38 },
    { label: 'Direct', value: 22 },
    { label: 'Social Media', value: 18 },
    { label: 'Email', value: 12 },
    { label: 'Paid Ads', value: 7 },
    { label: 'Referral', value: 3 },
  ],
  deviceBreakdown: [
    { label: 'Desktop', value: 54 },
    { label: 'Mobile', value: 38 },
    { label: 'Tablet', value: 8 },
  ],
  regionData: [
    { label: 'North America', value: 42 },
    { label: 'Europe', value: 28 },
    { label: 'Asia Pacific', value: 18 },
    { label: 'Latin America', value: 8 },
    { label: 'Other', value: 4 },
  ],
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const mockReports: Report[] = [
  {
    id: 'rpt_001',
    name: 'Q4 2024 Revenue Summary',
    description: 'Comprehensive revenue breakdown by channel, region, and product line for Q4 2024.',
    status: 'ready',
    format: 'PDF',
    createdAt: '2025-01-02T09:30:00Z',
    updatedAt: '2025-01-02T09:30:00Z',
    createdBy: 'Alex Rivera',
    size: '2.4 MB',
    tags: ['revenue', 'quarterly', 'finance'],
  },
  {
    id: 'rpt_002',
    name: 'User Acquisition Analysis',
    description: 'Monthly user acquisition funnel performance with cohort analysis.',
    status: 'ready',
    format: 'Excel',
    createdAt: '2025-01-05T14:20:00Z',
    updatedAt: '2025-01-05T14:20:00Z',
    createdBy: 'Alex Rivera',
    size: '1.8 MB',
    tags: ['users', 'acquisition', 'growth'],
  },
  {
    id: 'rpt_003',
    name: 'Marketing Channel Performance',
    description: 'ROI and conversion data across all marketing channels.',
    status: 'processing',
    format: 'PDF',
    createdAt: '2025-01-08T11:00:00Z',
    updatedAt: '2025-01-08T11:15:00Z',
    createdBy: 'Alex Rivera',
    tags: ['marketing', 'roi', 'channels'],
  },
  {
    id: 'rpt_004',
    name: 'Weekly KPI Digest',
    description: 'Automated weekly digest of key performance indicators.',
    status: 'scheduled',
    format: 'PDF',
    createdAt: '2025-01-06T08:00:00Z',
    updatedAt: '2025-01-06T08:00:00Z',
    createdBy: 'System',
    tags: ['kpi', 'automated', 'weekly'],
  },
  {
    id: 'rpt_005',
    name: 'Customer Segmentation Export',
    description: 'RFM-based customer segments for CRM import.',
    status: 'ready',
    format: 'CSV',
    createdAt: '2025-01-07T16:45:00Z',
    updatedAt: '2025-01-07T16:45:00Z',
    createdBy: 'Alex Rivera',
    size: '892 KB',
    tags: ['customers', 'segmentation', 'crm'],
  },
  {
    id: 'rpt_006',
    name: 'Data Pipeline Health Check',
    description: 'ETL pipeline status and data quality metrics.',
    status: 'failed',
    format: 'JSON',
    createdAt: '2025-01-08T07:30:00Z',
    updatedAt: '2025-01-08T07:42:00Z',
    createdBy: 'System',
    tags: ['data', 'pipeline', 'technical'],
  },
];

// ─── Import Records ───────────────────────────────────────────────────────────
export const mockImportRecords: ImportRecord[] = [
  {
    id: 'imp_001',
    filename: 'sales_data_december_2024.csv',
    rows: 15420,
    columns: 18,
    status: 'success',
    importedAt: '2025-01-02T10:15:00Z',
    importedBy: 'Alex Rivera',
    fileSize: '3.2 MB',
    fileType: 'CSV',
  },
  {
    id: 'imp_002',
    filename: 'user_events_q4.xlsx',
    rows: 89240,
    columns: 12,
    status: 'success',
    importedAt: '2025-01-03T14:30:00Z',
    importedBy: 'Alex Rivera',
    fileSize: '12.7 MB',
    fileType: 'Excel',
  },
  {
    id: 'imp_003',
    filename: 'product_catalog_v3.csv',
    rows: 4850,
    columns: 24,
    status: 'processing',
    importedAt: '2025-01-08T11:45:00Z',
    importedBy: 'Alex Rivera',
    fileSize: '1.1 MB',
    fileType: 'CSV',
  },
  {
    id: 'imp_004',
    filename: 'marketing_spend_jan.xlsx',
    rows: 0,
    columns: 0,
    status: 'error',
    importedAt: '2025-01-07T09:20:00Z',
    importedBy: 'Alex Rivera',
    errorMessage: 'Schema mismatch: expected column "campaign_id" not found.',
    fileSize: '450 KB',
    fileType: 'Excel',
  },
  {
    id: 'imp_005',
    filename: 'crm_export_all_customers.csv',
    rows: 32100,
    columns: 31,
    status: 'success',
    importedAt: '2025-01-06T16:00:00Z',
    importedBy: 'Alex Rivera',
    fileSize: '8.9 MB',
    fileType: 'CSV',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    title: 'Report Ready',
    message: 'Q4 2024 Revenue Summary has finished generating.',
    type: 'success',
    read: false,
    createdAt: '2025-01-08T09:30:00Z',
  },
  {
    id: 'notif_002',
    title: 'Import Failed',
    message: 'marketing_spend_jan.xlsx failed to import due to a schema mismatch.',
    type: 'error',
    read: false,
    createdAt: '2025-01-07T09:22:00Z',
  },
  {
    id: 'notif_003',
    title: 'KPI Alert',
    message: 'Conversion rate dropped below 3.0% threshold.',
    type: 'warning',
    read: false,
    createdAt: '2025-01-07T14:00:00Z',
  },
  {
    id: 'notif_004',
    title: 'Data Sync Complete',
    message: 'CRM data has been synced successfully — 32,100 records updated.',
    type: 'info',
    read: true,
    createdAt: '2025-01-06T16:05:00Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

export const formatCurrency = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
};

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
