'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => setSettings(res.data));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await adminApi.updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <div className="p-6 text-gray-400">Loading…</div>;

  return (
    <div>
      <Header title="Platform Settings" />
      <div className="p-6">
        <form onSubmit={handleSave} className="max-w-lg space-y-5 bg-white rounded-xl border border-gray-200 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
            <input
              value={settings.platformName ?? ''}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (e.g. 0.18 for 18%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={settings.commissionRate ?? 0.18}
              onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Boy Pay Per Delivery (₹)
            </label>
            <input
              type="number"
              value={settings.dbPayPerDelivery ?? 30}
              onChange={(e) => setSettings({ ...settings, dbPayPerDelivery: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Contact</label>
            <input
              value={settings.supportContact ?? ''}
              onChange={(e) => setSettings({ ...settings, supportContact: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenance"
              checked={settings.maintenanceMode ?? false}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="maintenance" className="text-sm font-medium text-gray-700">
              Maintenance Mode
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
