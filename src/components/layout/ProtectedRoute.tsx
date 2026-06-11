/**
 * ProtectedRoute
 *
 * - While the auth hook is restoring session from localStorage (isLoading=true),
 *   show a full-screen spinner instead of flashing the login page.
 * - Once resolved: redirect to /login if not authenticated, else render children.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Zap } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Don't redirect yet — we're still checking the stored token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1020] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
          >
            <Zap size={20} className="text-white" />
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
