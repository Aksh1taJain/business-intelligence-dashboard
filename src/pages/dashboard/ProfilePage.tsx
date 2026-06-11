import { useState } from 'react';
import { Camera, Mail, Briefcase, Calendar, Shield, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, PageHeader, Divider } from '@/components/ui/index';
import { formatDate } from '@/data/mockData';

export function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your personal information and account settings" />

      {/* ─── Avatar + Identity ────────────────────────────────── */}
      <Card title="Personal Information">
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {initials}
            </div>
            <button
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#0f1729] text-white transition-colors"
              style={{ background: '#3b82f6' }}
            >
              <Camera size={12} />
            </button>
          </div>

          {/* Name + role */}
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-[#64748b] capitalize mt-0.5">{user?.role} · {user?.department}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="status-dot online" />
              <span className="text-xs text-[#475569]">Online</span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Department</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={handleSave}
            className={`btn-primary flex items-center gap-2 text-xs transition-all ${saved ? 'bg-emerald-600' : ''}`}
          >
            <Save size={13} />
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </Card>

      {/* ─── Account Details ─────────────────────────────────── */}
      <Card title="Account Details">
        <div className="space-y-4">
          {[
            { icon: <Mail size={14} />, label: 'Email address', value: user?.email ?? '—' },
            { icon: <Shield size={14} />, label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—' },
            { icon: <Briefcase size={14} />, label: 'Department', value: user?.department ?? '—' },
            { icon: <Calendar size={14} />, label: 'Member since', value: user?.joinedAt ? formatDate(user.joinedAt) : '—' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="text-[#475569] flex-shrink-0">{item.icon}</div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs text-[#64748b]">{item.label}</span>
                <span className="text-sm text-white font-medium">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Danger Zone ──────────────────────────────────────── */}
      <Card title="Danger Zone">
        <p className="text-xs text-[#64748b] mb-4 leading-relaxed">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 border transition-colors hover:bg-rose-400/10"
          style={{ borderColor: 'rgba(244,63,94,0.3)' }}
        >
          Delete account
        </button>
      </Card>
    </div>
  );
}
