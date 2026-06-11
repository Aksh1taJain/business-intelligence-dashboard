import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { config } from '../config/env';
import type {
  AuthenticatedRequest,
  UserRow,
  SafeUser,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip password_hash before sending user data to the client. */
function toSafeUser(row: UserRow): SafeUser {
  const { password_hash: _, ...safe } = row;
  return safe;
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    // Check for existing account (case-insensitive via CITEXT column)
    const existing = await query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      sendError(res, 'An account with that email already exists.', { status: 409 });
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, config.bcrypt.rounds);

    // Insert user
    const result = await query<UserRow>(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, 'analyst', NULL)
       RETURNING *`,
      [name.trim(), email, password_hash],
    );

    const user = result.rows[0];
    if (!user) throw new Error('Insert did not return a row.');

    // Generate token
    const token = signToken({
      sub:   user.id,
      email: user.email,
      role:  user.role,
    });

    sendSuccess(
      res,
      { token, user: toSafeUser(user) },
      { status: 201, message: 'Account created successfully.' },
    );
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // Fetch user — single query so timing is consistent
    const result = await query<UserRow>(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email],
    );

    const user = result.rows[0];

    // Always run bcrypt.compare to prevent timing attacks even when user not found
    const dummyHash = '$2a$12$invalidhashthatisjustusedfortimingprotection000000000000';
    const passwordMatch = await bcrypt.compare(
      password,
      user?.password_hash ?? dummyHash,
    );

    if (!user || !passwordMatch) {
      sendError(res, 'Invalid email or password.', { status: 401 });
      return;
    }

    // Update last_login_at (fire-and-forget — don't block the response)
    query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]).catch(
      (err: Error) => console.error('[auth] Failed to update last_login_at:', err.message),
    );

    const token = signToken({
      sub:   user.id,
      email: user.email,
      role:  user.role,
    });

    sendSuccess(res, { token, user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/profile ────────────────────────────────────────────────────

export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const { sub: userId } = (req as AuthenticatedRequest).user;

    const result = await query<UserRow>(
      'SELECT * FROM users WHERE id = $1 AND is_active = TRUE',
      [userId],
    );

    const user = result.rows[0];
    if (!user) {
      // Token is valid but the account was deactivated after it was issued
      sendError(res, 'Account not found or deactivated.', { status: 404 });
      return;
    }

    sendSuccess(res, { user: toSafeUser(user) });
  } catch (err) {
    next(err);
  }
};
