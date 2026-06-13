/**
 * src/services/importService.ts
 *
 * Typed API wrappers for the three import endpoints.
 */

import { api, tokenStorage } from './api';

// ─── Shared shapes (mirror backend ImportHistoryItem / ImportPreview) ─────────

export type ImportStatus = 'pending' | 'processing' | 'success' | 'error';

export interface ImportRecord {
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
  uploaded_by_name: string;
  dataset_name: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ColumnDescriptor {
  name: string;
  sample: string;
}

export interface ImportPreview {
  import_id: string;
  filename: string;
  columns: ColumnDescriptor[];
  rows: Record<string, string>[];
  total_rows: number;
  previewing: number;
}

export interface UploadResult {
  import: ImportRecord;
  dataset: {
    id: string;
    name: string;
    row_count: number;
    column_count: number;
  };
  summary: {
    rows_imported: number;
    columns_found: number;
    file_size_bytes: number;
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const importService = {
  /**
   * Upload a CSV file.
   * Uses fetch directly (not api.post) because we need multipart/form-data,
   * not JSON — so we must NOT set Content-Type manually (browser sets boundary).
   */
  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = tokenStorage.get();
    const BASE_URL =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (import.meta as any).env?.['VITE_API_URL'] ?? 'http://localhost:4000/api';

    const response = await fetch(`${BASE_URL}/import/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error ?? 'Upload failed.');
    }
    return body.data as UploadResult;
  },

  /** GET /api/import/history — returns the authenticated user's imports */
  getHistory: async (): Promise<ImportRecord[]> => {
    const data = await api.get<{ imports: ImportRecord[]; total: number }>('/import/history');
    return data.imports;
  },

  /** GET /api/import/:id/preview?limit=20 */
  getPreview: async (importId: string, limit = 20): Promise<ImportPreview> => {
    return api.get<ImportPreview>(`/import/${importId}/preview?limit=${limit}`);
  },
};
