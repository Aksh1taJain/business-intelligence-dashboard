/**
 * src/services/authService.ts
 *
 * All auth-related API calls. Consumed by useAuth hook.
 */

import { api, tokenStorage } from './api';
import type { User } from '@/types';

// ─── Response shapes (matching backend SafeUser) ──────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  department: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthResult {
  token: string;
  user: AuthUser;
}

interface ProfileResult {
  user: AuthUser;
}

// ─── Map backend user → frontend User type ────────────────────────────────────

export function toFrontendUser(u: AuthUser): User {
  return {
    id:         u.id,
    name:       u.name,
    email:      u.email,
    role:       u.role,
    department: u.department ?? 'Unknown',
    joinedAt:   u.created_at,
    avatar:     u.avatar_url ?? undefined,
  };
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export const authService = {
  /**
   * Register a new account.
   * On success, persists the token to localStorage.
   */
  register: async (name: string, email: string, password: string): Promise<User> => {
    const data = await api.post<AuthResult>('/auth/register', { name, email, password });
    tokenStorage.set(data.token);
    return toFrontendUser(data.user);
  },

  /**
   * Log in with email + password.
   * On success, persists the token to localStorage.
   */
  login: async (email: string, password: string): Promise<User> => {
    const data = await api.post<AuthResult>('/auth/login', { email, password });
    tokenStorage.set(data.token);
    return toFrontendUser(data.user);
  },

  /**
   * Fetch the currently authenticated user's profile.
   * Uses the stored JWT — call this on app boot to restore session.
   */
  getProfile: async (): Promise<User> => {
    const data = await api.get<ProfileResult>('/auth/profile');
    return toFrontendUser(data.user);
  },

  /**
   * Clear the stored token. No server call needed (stateless JWT).
   */
  logout: (): void => {
    tokenStorage.clear();
  },

  /**
   * True if a token is currently stored (doesn't verify expiry).
   */
  hasToken: (): boolean => tokenStorage.get() !== null,
};
