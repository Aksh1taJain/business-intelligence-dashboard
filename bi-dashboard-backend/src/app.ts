import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import apiRouter from './routes';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  // ─── Security headers ──────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ─── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ─── Logging ───────────────────────────────────────────────────────────────
  app.use(morgan(config.server.isDev ? 'dev' : 'combined'));

  // ─── Global rate limiter ───────────────────────────────────────────────────
  // Stricter limiter on auth routes defined in routes/auth.ts
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Too many requests. Please try again later.' },
    }),
  );

  // ─── Auth-specific rate limiter ────────────────────────────────────────────
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,                   // max 20 login/register attempts per 15 min per IP
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Too many auth attempts. Please wait before trying again.' },
    }),
  );

  // ─── API routes ────────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ─── Error handling (must be last) ────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
