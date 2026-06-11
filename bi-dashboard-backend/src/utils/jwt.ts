import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import type { JwtPayload } from '../types';

/**
 * Sign a new JWT for the given payload.
 * Returns the signed token string.
 */
export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

/**
 * Verify and decode a JWT.
 * Throws JsonWebTokenError / TokenExpiredError on failure.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret, {
    algorithms: ['HS256'],
  }) as JwtPayload;
}

/**
 * Decode a JWT without verifying the signature.
 * Use only for non-security-sensitive inspection (e.g. reading expiry in a
 * refresh endpoint before we validate it properly).
 */
export function decodeToken(token: string): JwtPayload | null {
  const decoded = jwt.decode(token);
  return decoded as JwtPayload | null;
}
