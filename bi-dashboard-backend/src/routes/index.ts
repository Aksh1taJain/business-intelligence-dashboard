import { Router, type RequestHandler } from 'express';
import authRouter    from './auth';
import importRouter  from './import';
import reportsRouter from './reports';
import { sendSuccess } from '../utils/response';

const router = Router();

const healthHandler: RequestHandler = (_req, res) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
};
router.get('/health', healthHandler);

router.use('/auth',    authRouter);
router.use('/import',  importRouter);
router.use('/reports', reportsRouter);

export default router;
