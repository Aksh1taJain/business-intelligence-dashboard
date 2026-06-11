import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { sendError } from '../utils/response';
import { config } from '../config/env';

/**
 * 404 handler — attach after all routes.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  sendError(res, 'Route not found.', { status: 404 });
};

/**
 * Global error handler — attach last.
 * Catches anything passed via next(err).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[error]', err.stack ?? err.message);

  // Postgres unique violation (duplicate email)
  if ((err as NodeJS.ErrnoException & { code?: string }).code === '23505') {
    sendError(res, 'A record with that value already exists.', { status: 409 });
    return;
  }

  const message = config.server.isDev ? err.message : 'An unexpected error occurred.';
  sendError(res, message, { status: 500 });
};
