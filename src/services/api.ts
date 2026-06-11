/**
 * src/services/api.ts
 *
 * Central HTTP client for all backend calls.
 * - Reads/writes the JWT from localStorage
 * - Attaches Authorization header automatically
 * - Normalises errors into a consistent shape
 * - Redirects to /login on 401 (expired token)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE_URL: string = (import.meta as any).env?.['VITE_API_URL'] ?? 'http://localhost:4000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: { field: string; message: string }[];
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'datapulse_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Token expired or invalid — force logout
  if (response.status === 401) {
    tokenStorage.clear();
    // Only redirect if we're inside the dashboard
    if (window.location.pathname.startsWith('/dashboard')) {
      window.location.href = '/login';
    }
  }

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    const errBody = body as ApiError;
    throw new ApiRequestError(
      response.status,
      errBody.error ?? 'An unexpected error occurred.',
      errBody.details,
    );
  }

  return (body as ApiSuccess<T>).data;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string)                        => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown)         => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)         => request<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)         => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                        => request<T>(path, { method: 'DELETE' }),
};
