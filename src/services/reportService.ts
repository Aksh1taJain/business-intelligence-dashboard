/**
 * src/services/reportService.ts
 *
 * Typed wrappers for all four report endpoints.
 */

import { api, tokenStorage } from './api';

// ─── Shared types ─────────────────────────────────────────────────────────────

export type ReportStatus = 'processing' | 'ready' | 'scheduled' | 'failed';
export type ReportFormat = 'PDF' | 'CSV' | 'Excel';

export interface ApiReport {
  id: string;
  name: string;
  description: string | null;
  status: ReportStatus;
  format: ReportFormat;
  file_size_bytes: number | null;
  tags: string[];
  config_json: { dataset_id?: string } | null;
  generated_at: string | null;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiDataset {
  id: string;
  name: string;
  row_count: number;
  column_count: number;
  file_size_bytes: number | null;
  created_at: string;
}

export interface CreateReportPayload {
  name: string;
  description: string;
  format: ReportFormat;
  dataset_id: string;
  tags: string[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const reportService = {
  /** GET /api/reports — list all reports for the current user */
  list: async (): Promise<ApiReport[]> => {
    const data = await api.get<{ reports: ApiReport[] }>('/reports');
    return data.reports;
  },

  /** GET /api/reports/datasets — datasets available for report generation */
  listDatasets: async (): Promise<ApiDataset[]> => {
    const data = await api.get<{ datasets: ApiDataset[] }>('/reports/datasets');
    return data.datasets;
  },

  /** POST /api/reports — generate a new report */
  create: async (payload: CreateReportPayload): Promise<ApiReport> => {
    const data = await api.post<{ report: ApiReport }>('/reports', payload);
    return data.report;
  },

  /**
   * GET /api/reports/:id/download
   * Uses fetch directly so we can handle a binary response (blob),
   * then triggers a browser download.
   */
  download: async (reportId: string, filename: string): Promise<void> => {
    const token = tokenStorage.get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BASE_URL = (import.meta as any).env?.['VITE_API_URL'] ?? 'http://localhost:4000/api';

    const response = await fetch(`${BASE_URL}/reports/${reportId}/download`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? 'Download failed.');
    }

    // Derive filename from Content-Disposition if available
    const disposition = response.headers.get('Content-Disposition');
    const serverFilename = disposition?.match(/filename="?([^"]+)"?/)?.[1];
    const downloadName = serverFilename ?? filename;

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
