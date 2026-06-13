import { Router, type RequestHandler } from 'express';
import authRouter   from './auth';
import importRouter from './import';
import { sendSuccess } from '../utils/response';

const router = Router();

// ─── Health check ─────────────────────────────────────────────────────────────
const healthHandler: RequestHandler = (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
};
router.get('/health', healthHandler);

// ─── Feature routers ──────────────────────────────────────────────────────────
router.use('/auth',   authRouter);
router.use('/import', importRouter);

// Phase 4+ routers:
// router.use('/reports',  reportsRouter);
// router.use('/analytics', analyticsRouter);

export default router;
