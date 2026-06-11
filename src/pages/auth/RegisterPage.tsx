import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiRequestError } from '@/services/api';

const passwordRules = [
  { label: 'At least 8 characters',   test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter',     test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number',               test: (p: string) => /[0-9]/.test(p) },
];

export function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});

    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError && err.details) {
        const map: Record<string, string> = {};
        err.details.forEach(d => { map[d.field] = d.message; });
        setFieldErrors(map);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1020] bg-grid flex items-center justify-center px-4 py-12">
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)' }}
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
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-[#64748b]">Start monitoring your business metrics</p>
        </div>

        <div className="glass-card p-7">
          {error && (
            <div
              className="px-4 py-3 rounded-lg mb-5 text-xs text-rose-400"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                  className={`input-field pl-9 ${fieldErrors['name'] ? 'border-rose-500' : ''}`}
                />
              </div>
              {fieldErrors['name'] && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors['name']}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Work email</label>
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

              {/* Password strength checklist */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  {passwordRules.map(rule => {
                    const passing = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${passing ? 'bg-emerald-500' : 'bg-white/10'}`}>
                          {passing && <Check size={9} strokeWidth={3} className="text-white" />}
                        </div>
                        <span className={`text-[11px] ${passing ? 'text-emerald-400' : 'text-[#475569]'}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" required className="mt-0.5 w-3.5 h-3.5 rounded accent-blue-500 flex-shrink-0" />
              <span className="text-xs text-[#64748b]">
                I agree to the{' '}
                <button type="button" className="text-[#3b82f6] hover:text-[#60a5fa]">Terms of Service</button>
                {' '}and{' '}
                <button type="button" className="text-[#3b82f6] hover:text-[#60a5fa]">Privacy Policy</button>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#475569] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
