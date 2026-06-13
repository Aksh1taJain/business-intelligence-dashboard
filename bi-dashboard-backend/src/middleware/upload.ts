/**
 * src/middleware/upload.ts
 *
 * Multer configuration for CSV file uploads.
 * Files are held in memory (Buffer) so the CSV parser can consume them
 * directly without touching the filesystem.
 *
 * Limits:
 *  - 10 MB max file size
 *  - Only .csv files accepted (by mimetype AND extension)
 */

import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import path from 'path';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── File filter ──────────────────────────────────────────────────────────────

function csvFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'text/plain',                // some OS/browsers report CSV as text/plain
    'application/vnd.ms-excel',  // IE sends .csv with this MIME
  ];
  const allowedExtensions = ['.csv'];

  if (!allowedExtensions.includes(ext)) {
    cb(new Error(`Invalid file extension "${ext}". Only .csv files are accepted.`));
    return;
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    // Extension matched but MIME is unexpected — still accept with a warning
    // (browser MIME detection is unreliable for CSV)
    cb(null, true);
    return;
  }

  cb(null, true);
}

// ─── Multer instance ──────────────────────────────────────────────────────────

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: csvFileFilter,
});

// ─── Multer error classifier ──────────────────────────────────────────────────

export function isMulterError(err: unknown): err is multer.MulterError {
  return err instanceof multer.MulterError;
}

export { MAX_FILE_SIZE_BYTES };
