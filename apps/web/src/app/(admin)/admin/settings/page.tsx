'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminSettings() {
  const [commission, setCommission] = useState('18');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<{ platformCommission: number }>('/admin/settings')
      .then((d) => setCommission(String(d.platformCommission * 100)))
      .catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api.patch('/admin/settings', { platformCommission: Number(commission) / 100 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
      <form onSubmit={save} className="bg-white rounded-xl p-6 shadow-sm max-w-md">
        <label className="block text-sm font-medium mb-1">Platform Commission (%)</label>
        <input type="number" min="0" max="100" value={commission}
          onChange={(e) => setCommission(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">
          {saved ? 'Saved!' : 'Save'}
        </button>
      </form>
    </>
  );
}
