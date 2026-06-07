'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Service { id: string; name: string; pricePerUnit: number; unit: string }

export default function VendorServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ name: '', pricePerUnit: '', unit: 'KG' });

  useEffect(() => { api.get<Service[]>('/vendors/me/services').then(setServices).catch(() => {}); }, []);

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    const s = await api.post<Service>('/vendors/me/services', {
      ...form, pricePerUnit: Number(form.pricePerUnit),
    });
    setServices((prev) => [...prev, s]);
    setForm({ name: '', pricePerUnit: '', unit: 'KG' });
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Services</h2>
      <form onSubmit={addService} className="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-3 flex-wrap max-w-2xl">
        <input required placeholder="Service name" value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-32" />
        <input required type="number" placeholder="Price" value={form.pricePerUnit}
          onChange={(e) => setForm((p) => ({ ...p, pricePerUnit: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm w-28" />
        <select value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
          className="border rounded-lg px-3 py-2 text-sm">
          <option>KG</option><option>PIECE</option><option>PAIR</option>
        </select>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Add</button>
      </form>
      <div className="space-y-2 max-w-2xl">
        {services.map((s) => (
          <div key={s.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex justify-between">
            <span className="font-medium">{s.name}</span>
            <span className="text-gray-500 text-sm">₹{s.pricePerUnit} / {s.unit}</span>
          </div>
        ))}
      </div>
    </>
  );
}
