/**
 * src/routes/import.ts
 *
 * POST /api/import/upload          — upload a CSV file
 * GET  /api/import/history         — list caller's import history
 * GET  /api/import/:id/preview     — preview rows for one import
 *
 * All routes require a valid JWT (authenticateToken).
 *
 * Multer is applied as an inline middleware on the upload route only.
 * Errors from multer are caught with a wrapper so they surface as JSON
 * rather than crashing the process.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { csvUpload } from '../middleware/upload';
import {
  uploadCSV,
  listImports,
  previewImport,
} from '../controllers/importController';

const router = Router();

// All import routes require authentication
router.use(authenticateToken);

// ─── Multer wrapper ───────────────────────────────────────────────────────────
// Multer calls next(err) on failure, but Express only routes errors to the
// global error handler — not to the next route handler.  We intercept here
// so the controller still receives the request and can return a clean JSON body.

function handleUpload(req: Request, res: Response, next: NextFunction): void {
  csvUpload.single('file')(req, res, (err) => {
    if (err) {
      // Stash the error on the request; the controller will inspect it
      (req as Request & { multerError?: Error }).multerError = err as Error;
    }
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/import/upload
 * Content-Type: multipart/form-data
 * Field name: "file"  (.csv only, max 10 MB)
 */
router.post('/upload', handleUpload, uploadCSV);

/**
 * GET /api/import/history
 * Returns last 100 imports for the authenticated user.
 */
router.get('/history', listImports);

/**
 * GET /api/import/:id/preview?limit=20
 * Returns up to `limit` rows (default 20, max 100) for the given import.
 */
router.get('/:id/preview', previewImport);

export default router;
