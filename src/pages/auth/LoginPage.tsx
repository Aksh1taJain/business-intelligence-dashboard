import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiRequestError } from '@/services/api';

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError && err.details) {
        const map: Record<string, string> = {};
        err.details.forEach(d => { map[d.field] = d.message; });
        setFieldErrors(map);
      }
      // Top-level error already set in useAuth via setError
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1020] bg-grid flex items-center justify-center px-4">
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
            >
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-white">DataPulse</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-[#64748b]">Sign in to your BI dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card p-7">
          {/* API-level error */}
          {error && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg mb-5 text-xs text-rose-400"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className={`input-field pl-9 ${fieldErrors['email'] ? 'border-rose-500' : ''}`}
                />
              </div>
              {fieldErrors['email'] && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors['email']}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`input-field pl-9 pr-10 ${fieldErrors['password'] ? 'border-rose-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors['password'] && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors['password']}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#64748b] cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-500" />
                Remember me
              </label>
              <button type="button" className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-[#334155]">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div
            className="px-4 py-3 rounded-lg text-xs text-[#64748b] text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="font-medium text-[#94a3b8]">Backend running?</span>{' '}
            Register first, then sign in with your credentials.
          </div>
        </div>

        <p className="text-center text-xs text-[#475569] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
