/**
 * src/controllers/importController.ts
 *
 * Handlers for all three import endpoints:
 *
 *  POST /api/import/upload      — receive CSV, parse, persist, return result
 *  GET  /api/import/history     — list caller's imports (newest first)
 *  GET  /api/import/:id/preview — first 20 rows of a completed import
 */

import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../types';
import { parseCSV } from '../services/csvParser';
import {
  createImportRecord,
  failImport,
  finaliseImport,
  getImportHistory,
  getImportPreview,
} from '../services/importService';
import { sendSuccess, sendError } from '../utils/response';
import { isMulterError } from '../middleware/upload';

// ─── POST /api/import/upload ──────────────────────────────────────────────────

export const uploadCSV: RequestHandler = async (req, res, next) => {
  // Multer errors surface as the first argument to the route handler when
  // multer is used as a single-file middleware before this controller.
  // We handle them here for a consistent JSON error shape.
  const multerErr = (req as unknown as { multerError?: Error }).multerError;
  if (multerErr) {
    if (isMulterError(multerErr) && multerErr.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File exceeds the 10 MB limit.', { status: 413 });
    } else {
      sendError(res, multerErr.message, { status: 400 });
    }
    return;
  }

  const file = req.file;
  if (!file) {
    sendError(res, 'No file uploaded. Send a multipart/form-data request with field name "file".', {
      status: 400,
    });
    return;
  }

  const userId = (req as AuthenticatedRequest).user.sub;

  // 1. Create a pending import row immediately so the client has an ID
  let importRecord;
  try {
    importRecord = await createImportRecord({
      filename:        file.originalname,
      file_type:       'CSV',
      file_size_bytes: file.size,
      uploaded_by:     userId,
    });
  } catch (err) {
    return next(err);
  }

  // 2. Parse the CSV buffer
  const parseResult = parseCSV(file.buffer, file.originalname);

  if (!parseResult.ok) {
    // Persist the failure so history shows what went wrong
    await failImport(importRecord.id, parseResult.message).catch(() => undefined);
    sendError(res, parseResult.message, { status: 422 });
    return;
  }

  const { headers, columnDescriptors, rows } = parseResult;

  // 3. Persist dataset + analytics_records inside a transaction
  try {
    const { importRow, datasetRow } = await finaliseImport({
      importId:          importRecord.id,
      filename:          file.originalname,
      uploadedBy:        userId,
      headers,
      columnDescriptors,
      rows,
      fileSizeBytes:     file.size,
    });

    sendSuccess(
      res,
      {
        import:  importRow,
        dataset: datasetRow,
        summary: {
          rows_imported: importRow.rows_imported,
          columns_found: importRow.columns_found,
          file_size_bytes: file.size,
        },
      },
      {
        status:  201,
        message: `Successfully imported ${importRow.rows_imported.toLocaleString()} rows from "${file.originalname}".`,
      },
    );
  } catch (err) {
    // Transaction failed — mark the import row as errored
    await failImport(importRecord.id, (err as Error).message).catch(() => undefined);
    next(err);
  }
};

// ─── GET /api/import/history ──────────────────────────────────────────────────

export const listImports: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user.sub;
    const history = await getImportHistory(userId);
    sendSuccess(res, { imports: history, total: history.length });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/import/:id/preview ─────────────────────────────────────────────

export const previewImport: RequestHandler = async (req, res, next) => {
  try {
    const userId   = (req as AuthenticatedRequest).user.sub;
    const importId = req.params['id'];

    if (!importId) {
      sendError(res, 'Import ID is required.', { status: 400 });
      return;
    }

    const PREVIEW_LIMIT = parseInt(req.query['limit'] as string, 10) || 20;
    const safeLimit     = Math.min(Math.max(PREVIEW_LIMIT, 1), 100);

    const preview = await getImportPreview(importId, userId, safeLimit);

    if (!preview) {
      sendError(res, 'Import not found or you do not have access to it.', { status: 404 });
      return;
    }

    sendSuccess(res, preview);
  } catch (err) {
    next(err);
  }
};
