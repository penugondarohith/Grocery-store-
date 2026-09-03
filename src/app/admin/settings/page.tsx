'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Settings, RefreshCw } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string | null;
}

const GROUPS: { title: string; keys: string[] }[] = [
  { title: 'Store Information', keys: ['store_name', 'store_email', 'store_phone', 'store_address', 'currency'] },
  { title: 'Pricing & Delivery', keys: ['delivery_fee', 'free_delivery_threshold', 'min_order_amount', 'tax_rate'] },
  { title: 'Notifications', keys: ['low_stock_notification', 'order_notification'] },
];

const BOOLEAN_KEYS = ['low_stock_notification', 'order_notification'];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/admin/settings');
    const d = await r.json();
    setSettings(d.settings ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const get = (key: string) => settings.find(s => s.key === key)?.value ?? '';
  const set = (key: string, value: string) => {
    setSettings(prev =>
      prev.some(s => s.key === key)
        ? prev.map(s => s.key === key ? { ...s, value } : s)
        : [...prev, { key, value, label: key.replace(/_/g, ' ') }]
    );
  };

  const save = async () => {
    setSaving(true);
    const r = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    setSaving(false);
    if (r.ok) showToast('Settings saved!');
    else showToast('Failed to save');
  };

  const getLabel = (key: string) => settings.find(s => s.key === key)?.label ?? key.replace(/_/g, ' ');

  return (
    <div className="space-y-6 max-w-2xl">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
            <Check className="w-4 h-4" />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400">Configure your store settings</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 disabled:opacity-60 shadow-sm shadow-green-200">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : settings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Settings className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No settings found. Configure your DATABASE_URL first.</p>
        </div>
      ) : (
        GROUPS.map(group => {
          const groupSettings = group.keys.filter(k => !settings.length || true); // show all
          return (
            <div key={group.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-700">{group.title}</h2>
              </div>
              <div className="p-5 space-y-4">
                {groupSettings.map(key => {
                  const isBoolean = BOOLEAN_KEYS.includes(key);
                  const val = get(key);
                  const label = getLabel(key);

                  return (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <label className="text-sm font-semibold text-gray-700 capitalize">{label}</label>
                        <p className="text-xs text-gray-400 font-mono">{key}</p>
                      </div>
                      {isBoolean ? (
                        <div
                          onClick={() => set(key, val === 'true' ? 'false' : 'true')}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer flex-shrink-0 ${val === 'true' ? 'bg-green-600' : 'bg-gray-200'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${val === 'true' ? 'translate-x-4' : ''}`} />
                        </div>
                      ) : (
                        <input
                          value={val}
                          onChange={e => set(key, e.target.value)}
                          className="w-48 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-red-50 bg-red-50/50">
          <h2 className="text-sm font-bold text-red-700">System Info</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Next.js Version', value: '16.x (App Router)' },
            { label: 'Backend', value: 'Express + Prisma v5' },
            { label: 'Database', value: 'PostgreSQL (Supabase)' },
            { label: 'Auth', value: 'Supabase Auth + JWT' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-mono font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
