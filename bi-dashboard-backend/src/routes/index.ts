import { Router, type RequestHandler } from 'express';
import authRouter from './auth';
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
router.use('/auth', authRouter);

// Phase 3+ routers go here:
// router.use('/datasets', datasetsRouter);
// router.use('/imports',  importsRouter);
// router.use('/reports',  reportsRouter);
// router.use('/analytics', analyticsRouter);

export default router;
