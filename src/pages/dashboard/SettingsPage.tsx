import { useState } from 'react';
import { Database, Key, RefreshCw } from 'lucide-react';
import { Card, PageHeader } from '@/components/ui/index';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
        checked ? 'bg-blue-600' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#0a1020] border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-[#64748b] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifKPI, setNotifKPI] = useState(true);
  const [notifReports, setNotifReports] = useState(false);
  const [notifImports, setNotifImports] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [dataRefresh, setDataRefresh] = useState('5m');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Platform preferences and configuration" />

      {/* ─── Notifications ──────────────────────────────────────── */}
      <Card title="Notifications" subtitle="Control when and how you receive alerts">
        <div className="divide-y divide-white/[0.04]">
          <SettingRow label="Email notifications" description="Receive updates via email">
            <Toggle checked={notifEmail} onChange={setNotifEmail} />
          </SettingRow>
          <SettingRow label="KPI threshold alerts" description="Alert when metrics cross thresholds">
            <Toggle checked={notifKPI} onChange={setNotifKPI} />
          </SettingRow>
          <SettingRow label="Report ready" description="Notify when reports finish generating">
            <Toggle checked={notifReports} onChange={setNotifReports} />
          </SettingRow>
          <SettingRow label="Import status" description="Notify on import success or failure">
            <Toggle checked={notifImports} onChange={setNotifImports} />
          </SettingRow>
        </div>
      </Card>

      {/* ─── Appearance ─────────────────────────────────────────── */}
      <Card title="Appearance">
        <div className="divide-y divide-white/[0.04]">
          <SettingRow label="Dark mode" description="Use the dark theme throughout the platform">
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </SettingRow>
          <SettingRow label="Language" description="Interface language">
            <Select
              value={language}
              onChange={setLanguage}
              options={[
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' },
              ]}
            />
          </SettingRow>
        </div>
      </Card>

      {/* ─── Data & Sync ────────────────────────────────────────── */}
      <Card title="Data & Sync">
        <div className="divide-y divide-white/[0.04]">
          <SettingRow label="Timezone" description="Used for all date and time displays">
            <Select
              value={timezone}
              onChange={setTimezone}
              options={[
                { label: 'UTC', value: 'UTC' },
                { label: 'EST (UTC-5)', value: 'EST' },
                { label: 'PST (UTC-8)', value: 'PST' },
                { label: 'IST (UTC+5:30)', value: 'IST' },
                { label: 'CET (UTC+1)', value: 'CET' },
              ]}
            />
          </SettingRow>
          <SettingRow label="Data refresh interval" description="How often to pull fresh metrics">
            <Select
              value={dataRefresh}
              onChange={setDataRefresh}
              options={[
                { label: 'Every 1 minute', value: '1m' },
                { label: 'Every 5 minutes', value: '5m' },
                { label: 'Every 15 minutes', value: '15m' },
                { label: 'Every 30 minutes', value: '30m' },
                { label: 'Manual only', value: 'manual' },
              ]}
            />
          </SettingRow>
        </div>
      </Card>

      {/* ─── Security ───────────────────────────────────────────── */}
      <Card title="Security">
        <div className="space-y-3">
          {[
            { icon: <Key size={14} />, label: 'Change password', desc: 'Last changed 30 days ago' },
            { icon: <RefreshCw size={14} />, label: 'Regenerate API key', desc: 'Your current key: sk-••••••••••••••••' },
            { icon: <Database size={14} />, label: 'Export my data', desc: 'Download all your data as JSON' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5">
              <div className="flex items-start gap-3">
                <div className="text-[#475569] mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{item.desc}</p>
                </div>
              </div>
              <button className="btn-ghost text-xs px-3 py-1.5">Action</button>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Save ───────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`btn-primary text-xs px-5 transition-all ${saved ? '!bg-emerald-600' : ''}`}
        >
          {saved ? 'Settings saved!' : 'Save all settings'}
        </button>
        <button className="btn-ghost text-xs px-5">Reset to defaults</button>
      </div>
    </div>
  );
}
