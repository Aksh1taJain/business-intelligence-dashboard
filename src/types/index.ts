// ─── User & Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
  department: string;
  joinedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── KPI & Metrics ───────────────────────────────────────────────────────────
export interface KPIMetric {
  id: string;
  label: string;
  value: number | string;
  change: number;       // percentage, positive = up
  changeLabel: string;
  unit?: string;
  prefix?: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  icon: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  revenue: number;
  users: number;
  sessions: number;
  conversions: number;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface AnalyticsData {
  timeSeries: TimeSeriesDataPoint[];
  topChannels: ChartDataPoint[];
  deviceBreakdown: ChartDataPoint[];
  regionData: ChartDataPoint[];
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export type ReportStatus = 'ready' | 'processing' | 'scheduled' | 'failed';
export type ReportFormat = 'PDF' | 'CSV' | 'Excel' | 'JSON';

export interface Report {
  id: string;
  name: string;
  description: string;
  status: ReportStatus;
  format: ReportFormat;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  size?: string;
  tags: string[];
}

// ─── Data Import ─────────────────────────────────────────────────────────────
export type ImportStatus = 'success' | 'pending' | 'error' | 'processing';

export interface ImportRecord {
  id: string;
  filename: string;
  rows: number;
  columns: number;
  status: ImportStatus;
  importedAt: string;
  importedBy: string;
  errorMessage?: string;
  fileSize: string;
  fileType: 'CSV' | 'Excel';
}

// ─── Navigation ──────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  end?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// ─── Notifications ───────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// ─── Table ───────────────────────────────────────────────────────────────────
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}
