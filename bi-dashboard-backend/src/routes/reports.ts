/**
 * src/routes/reports.ts
 *
 * POST /api/reports                — generate a new report
 * GET  /api/reports                — list caller's reports
 * GET  /api/reports/datasets       — list datasets available for generation
 * GET  /api/reports/:id/download   — download the generated file
 *
 * All routes require JWT authentication.
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createReport,
  getReports,
  getDatasets,
  downloadReport,
} from '../controllers/reportController';

const router = Router();

router.use(authenticateToken);

// Static sub-routes before the :id param route
router.get('/datasets', getDatasets);

router.get('/',    getReports);
router.post('/',   createReport);
router.get('/:id/download', downloadReport);

export default router;
