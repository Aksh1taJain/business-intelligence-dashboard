import type { Response } from 'express';
import type { ApiSuccess, ApiError } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { message?: string; status?: number } = {},
): void {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(options.message ? { message: options.message } : {}),
  };
  res.status(options.status ?? 200).json(body);
}

export function sendError(
  res: Response,
  error: string,
  options: { status?: number; details?: Record<string, string>[] } = {},
): void {
  const body: ApiError = {
    success: false,
    error,
    ...(options.details ? { details: options.details } : {}),
  };
  res.status(options.status ?? 500).json(body);
}
