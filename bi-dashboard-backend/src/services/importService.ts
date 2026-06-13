/**
 * src/services/importService.ts
 *
 * All database operations for the import pipeline.
 * The controller stays thin; all queries live here.
 */

import { query, withTransaction } from '../db/pool';
import type {
  ImportRow,
  DatasetRow,
  ImportHistoryItem,
  ImportPreview,
  ColumnDescriptor,
  AnalyticsRecordRow,
} from '../types';

// ─── Create a pending import record ──────────────────────────────────────────

export async function createImportRecord(params: {
  filename: string;
  file_type: 'CSV' | 'Excel';
  file_size_bytes: number;
  uploaded_by: string;
}): Promise<ImportRow> {
  const result = await query<ImportRow>(
    `INSERT INTO imports (filename, file_type, file_size_bytes, status, uploaded_by, started_at)
     VALUES ($1, $2, $3, 'processing', $4, NOW())
     RETURNING *`,
    [params.filename, params.file_type, params.file_size_bytes, params.uploaded_by],
  );
  const row = result.rows[0];
  if (!row) throw new Error('Import record insert returned no row.');
  return row;
}

// ─── Mark an import as failed ─────────────────────────────────────────────────

export async function failImport(importId: string, errorMessage: string): Promise<void> {
  await query(
    `UPDATE imports
     SET status = 'error', error_message = $2, completed_at = NOW()
     WHERE id = $1`,
    [importId, errorMessage],
  );
}

// ─── Full success path — dataset + records in one transaction ─────────────────

export async function finaliseImport(params: {
  importId: string;
  filename: string;
  uploadedBy: string;
  headers: string[];
  columnDescriptors: ColumnDescriptor[];
  rows: Record<string, string>[];
  fileSizeBytes: number;
}): Promise<{ importRow: ImportRow; datasetRow: DatasetRow }> {
  return withTransaction(async (q) => {
    const { importId, filename, uploadedBy, headers, columnDescriptors, rows, fileSizeBytes } = params;

    // 1. Create dataset metadata record
    const datasetName = filename.replace(/\.[^.]+$/, '');   // strip extension
    const schemaJson = columnDescriptors.map(c => ({
      name: c.name,
      type: 'string',
      sample: c.sample,
    }));

    const datasetResult = await q<DatasetRow>(
      `INSERT INTO datasets
         (name, source_type, schema_json, row_count, column_count, file_size_bytes, created_by)
       VALUES ($1, 'import', $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        datasetName,
        JSON.stringify(schemaJson),
        rows.length,
        headers.length,
        fileSizeBytes,
        uploadedBy,
      ],
    );
    const datasetRow = datasetResult.rows[0];
    if (!datasetRow) throw new Error('Dataset insert returned no row.');

    // 2. Bulk-insert analytics records in chunks of 500 to avoid huge queries
    const CHUNK_SIZE = 500;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const values: unknown[] = [];
      const placeholders = chunk.map((row, idx) => {
        const base = idx * 4;
        values.push(importId, datasetRow.id, i + idx, JSON.stringify(row));
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
      });

      await q(
        `INSERT INTO analytics_records (import_id, dataset_id, row_index, data)
         VALUES ${placeholders.join(', ')}`,
        values,
      );
    }

    // 3. Update import record to success
    const importResult = await q<ImportRow>(
      `UPDATE imports
       SET status        = 'success',
           rows_imported = $2,
           columns_found = $3,
           dataset_id    = $4,
           completed_at  = NOW()
       WHERE id = $1
       RETURNING *`,
      [importId, rows.length, headers.length, datasetRow.id],
    );
    const importRow = importResult.rows[0];
    if (!importRow) throw new Error('Import update returned no row.');

    return { importRow, datasetRow };
  });
}

// ─── GET /api/import/history ──────────────────────────────────────────────────

export async function getImportHistory(uploadedBy: string): Promise<ImportHistoryItem[]> {
  const result = await query<ImportHistoryItem>(
    `SELECT
       i.*,
       d.name  AS dataset_name,
       u.name  AS uploaded_by_name
     FROM imports i
     JOIN users u ON u.id = i.uploaded_by
     LEFT JOIN datasets d ON d.id = i.dataset_id
     WHERE i.uploaded_by = $1
     ORDER BY i.created_at DESC
     LIMIT 100`,
    [uploadedBy],
  );
  return result.rows;
}

// ─── GET /api/import/:id/preview ─────────────────────────────────────────────

export async function getImportPreview(
  importId: string,
  uploadedBy: string,
  limit = 20,
): Promise<ImportPreview | null> {
  // Verify ownership
  const importResult = await query<ImportRow>(
    `SELECT * FROM imports WHERE id = $1 AND uploaded_by = $2`,
    [importId, uploadedBy],
  );
  const importRow = importResult.rows[0];
  if (!importRow) return null;

  if (importRow.status !== 'success') {
    return {
      import_id: importId,
      filename: importRow.filename,
      columns: [],
      rows: [],
      total_rows: importRow.rows_imported,
      previewing: 0,
    };
  }

  // Fetch preview rows
  const recordsResult = await query<AnalyticsRecordRow>(
    `SELECT * FROM analytics_records
     WHERE import_id = $1
     ORDER BY row_index ASC
     LIMIT $2`,
    [importId, limit],
  );
  const records = recordsResult.rows;

  if (records.length === 0) {
    return {
      import_id: importId,
      filename: importRow.filename,
      columns: [],
      rows: [],
      total_rows: importRow.rows_imported,
      previewing: 0,
    };
  }

  // Derive column descriptors from dataset schema if available
  let columns: ColumnDescriptor[] = [];
  if (importRow.dataset_id) {
    const dsResult = await query<DatasetRow>(
      `SELECT schema_json FROM datasets WHERE id = $1`,
      [importRow.dataset_id],
    );
    const schema = dsResult.rows[0]?.schema_json;
    if (Array.isArray(schema)) {
      columns = (schema as { name: string; sample: string }[]).map(c => ({
        name: c.name,
        sample: c.sample,
      }));
    }
  }

  // Fallback: derive columns from first row keys
  if (columns.length === 0 && records[0]) {
    columns = Object.keys(records[0].data).map(name => ({
      name,
      sample: records[0]!.data[name] ?? '',
    }));
  }

  return {
    import_id: importId,
    filename: importRow.filename,
    columns,
    rows: records.map(r => r.data),
    total_rows: importRow.rows_imported,
    previewing: records.length,
  };
}

// ─── Single import by ID (for ownership checks) ───────────────────────────────

export async function getImportById(
  importId: string,
  uploadedBy: string,
): Promise<ImportRow | null> {
  const result = await query<ImportRow>(
    `SELECT * FROM imports WHERE id = $1 AND uploaded_by = $2`,
    [importId, uploadedBy],
  );
  return result.rows[0] ?? null;
}
