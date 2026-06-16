/**
 * src/services/reportService.ts
 *
 * All database operations for reports.
 * Generation (PDF/Excel/CSV bytes) lives in reportGenerators.ts.
 */

import { query } from '../db/pool';
import type { ReportRow, ReportFormat, DatasetRow, AnalyticsRecordRow } from '../types';

// ─── List reports for a user ──────────────────────────────────────────────────

export interface ReportListItem extends ReportRow {
  created_by_name: string;
}

export async function listReports(createdBy: string): Promise<ReportListItem[]> {
  const result = await query<ReportListItem>(
    `SELECT r.*, u.name AS created_by_name
     FROM reports r
     JOIN users u ON u.id = r.created_by
     WHERE r.created_by = $1
     ORDER BY r.created_at DESC
     LIMIT 100`,
    [createdBy],
  );
  return result.rows;
}

// ─── Get single report (with ownership check) ─────────────────────────────────

export async function getReportById(
  reportId: string,
  createdBy: string,
): Promise<ReportRow | null> {
  const result = await query<ReportRow>(
    `SELECT * FROM reports WHERE id = $1 AND created_by = $2`,
    [reportId, createdBy],
  );
  return result.rows[0] ?? null;
}

// ─── Create a report row (status = processing) ────────────────────────────────

export interface CreateReportParams {
  name: string;
  description: string;
  format: ReportFormat;
  datasetId: string;
  createdBy: string;
  tags: string[];
}

export async function createReportRecord(params: CreateReportParams): Promise<ReportRow> {
  const configJson = { dataset_id: params.datasetId };

  const result = await query<ReportRow>(
    `INSERT INTO reports
       (name, description, format, status, tags, config_json, created_by)
     VALUES ($1, $2, $3, 'processing', $4, $5, $6)
     RETURNING *`,
    [
      params.name,
      params.description,
      params.format,
      params.tags,
      JSON.stringify(configJson),
      params.createdBy,
    ],
  );

  const row = result.rows[0];
  if (!row) throw new Error('Report insert returned no row.');
  return row;
}

// ─── Mark report ready ────────────────────────────────────────────────────────

export async function markReportReady(
  reportId: string,
  fileSizeBytes: number,
): Promise<ReportRow> {
  const result = await query<ReportRow>(
    `UPDATE reports
     SET status = 'ready',
         file_size_bytes = $2,
         generated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [reportId, fileSizeBytes],
  );
  const row = result.rows[0];
  if (!row) throw new Error('Report not found when marking ready.');
  return row;
}

// ─── Mark report failed ───────────────────────────────────────────────────────

export async function markReportFailed(reportId: string): Promise<void> {
  await query(
    `UPDATE reports SET status = 'failed' WHERE id = $1`,
    [reportId],
  );
}

// ─── Fetch dataset + all its analytics records ────────────────────────────────

export interface DatasetWithRecords {
  dataset: DatasetRow;
  columns: string[];
  rows: Record<string, string>[];
}

export async function fetchDatasetRecords(datasetId: string): Promise<DatasetWithRecords | null> {
  // Fetch dataset metadata
  const dsResult = await query<DatasetRow>(
    `SELECT * FROM datasets WHERE id = $1 AND is_archived = FALSE`,
    [datasetId],
  );
  const dataset = dsResult.rows[0];
  if (!dataset) return null;

  // Fetch all rows ordered by insertion order
  const recResult = await query<AnalyticsRecordRow>(
    `SELECT data FROM analytics_records
     WHERE dataset_id = $1
     ORDER BY row_index ASC`,
    [datasetId],
  );

  const rows = recResult.rows.map(r => r.data);
  const columns = rows.length > 0 ? Object.keys(rows[0]!) : [];

  return { dataset, columns, rows };
}

// ─── List datasets available to a user (for the "New Report" modal) ───────────

export async function listDatasets(createdBy: string): Promise<DatasetRow[]> {
  const result = await query<DatasetRow>(
    `SELECT * FROM datasets
     WHERE created_by = $1 AND is_archived = FALSE
     ORDER BY created_at DESC`,
    [createdBy],
  );
  return result.rows;
}
