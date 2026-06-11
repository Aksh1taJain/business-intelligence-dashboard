import type { RequestHandler, Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserRole } from '../types';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * authenticateToken
 * -----------------
 * Reads the Bearer token from the Authorization header, verifies it, and
 * attaches the decoded payload to `req.user`.
 *
 * Usage: router.get('/protected', authenticateToken, handler)
 */
export const authenticateToken: RequestHandler = (
  req,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authorization header missing or malformed. Expected: Bearer <token>', {
      status: 401,
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      sendError(res, 'Token has expired. Please log in again.', { status: 401 });
    } else if (err instanceof JsonWebTokenError) {
      sendError(res, 'Invalid token.', { status: 401 });
    } else {
      sendError(res, 'Authentication failed.', { status: 401 });
    }
  }
};

/**
 * requireRole
 * -----------
 * Role-based access guard. Must be used AFTER authenticateToken.
 *
 * Usage: router.delete('/users/:id', authenticateToken, requireRole('admin'), handler)
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      sendError(res, 'Unauthenticated.', { status: 401 });
      return;
    }

    if (!roles.includes(user.role)) {
      sendError(res, `Access denied. Required role: ${roles.join(' or ')}.`, {
        status: 403,
      });
      return;
    }

    next();
  };
}
