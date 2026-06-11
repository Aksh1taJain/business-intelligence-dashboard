/**
 * src/hooks/useAuth.tsx
 *
 * Real implementation wired to the Express/PostgreSQL backend.
 *
 * Key behaviours:
 *  - On mount: calls GET /api/auth/profile with the stored token to restore
 *    session state across page refreshes. Shows a loading spinner until done.
 *  - login / register: call the backend, store the returned JWT, update state.
 *  - logout: clears the token and resets state. No server round-trip needed
 *    (JWTs are stateless — just discard the token on the client).
 *  - Any 401 from the API client (api.ts) also clears the token and redirects
 *    to /login automatically.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, AuthState } from '@/types';
import { authService } from '@/services/authService';
import { ApiRequestError } from '@/services/api';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  logout:   () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  error:    string | null;
  clearError: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,            setUser]            = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading,       setIsLoading]       = useState(true);   // true on first mount
  const [error,           setError]           = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Restore session on page refresh ──────────────────────────────────────
  useEffect(() => {
    if (!authService.hasToken()) {
      setIsLoading(false);
      return;
    }

    authService
      .getProfile()
      .then((u) => {
        setUser(u);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // Token was invalid / expired — clean up silently
        authService.logout();
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const u = await authService.login(email, password);
      setUser(u);
      setIsAuthenticated(true);
    } catch (err) {
      const msg =
        err instanceof ApiRequestError ? err.message : 'Login failed. Please try again.';
      setError(msg);
      throw err; // re-throw so form can react
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const u = await authService.register(name, email, password);
      setUser(u);
      setIsAuthenticated(true);
    } catch (err) {
      const msg =
        err instanceof ApiRequestError ? err.message : 'Registration failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, register, error, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
