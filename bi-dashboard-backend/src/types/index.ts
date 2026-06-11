import type { Request } from 'express';

// ─── Database row shapes ──────────────────────────────────────────────────────

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type ImportStatus = 'pending' | 'processing' | 'success' | 'error';
export type ReportStatus = 'processing' | 'ready' | 'scheduled' | 'failed';
export type ReportFormat = 'PDF' | 'CSV' | 'Excel' | 'JSON';

export interface DatasetRow {
  id: string;
  name: string;
  description: string | null;
  source_type: string;
  schema_json: unknown;
  row_count: number;
  column_count: number;
  file_size_bytes: number | null;
  tags: string[];
  is_archived: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ImportRow {
  id: string;
  filename: string;
  file_type: 'CSV' | 'Excel';
  file_size_bytes: number;
  status: ImportStatus;
  rows_imported: number;
  columns_found: number;
  error_message: string | null;
  dataset_id: string | null;
  uploaded_by: string;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ReportRow {
  id: string;
  name: string;
  description: string | null;
  status: ReportStatus;
  format: ReportFormat;
  storage_key: string | null;
  file_size_bytes: number | null;
  tags: string[];
  config_json: unknown;
  scheduled_at: Date | null;
  generated_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// ─── JWT payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Extended Express Request ─────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;  // populated by authenticateToken middleware
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string>[];
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Safe user (no password_hash) ────────────────────────────────────────────

export type SafeUser = Omit<UserRow, 'password_hash'>;
