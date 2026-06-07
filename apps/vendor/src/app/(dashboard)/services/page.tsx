'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { vendorApi } from '@/lib/api';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', pricePerUnit: '', unitType: 'KG' });
  const [saving, setSaving] = useState(false);

  const fetchServices = () => {
    vendorApi.getServices().then((res) => setServices(res.data));
  };

  useEffect(fetchServices, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await vendorApi.addService({ ...form, pricePerUnit: parseFloat(form.pricePerUnit) });
    setSaving(false);
    setShowForm(false);
    setForm({ name: '', pricePerUnit: '', unitType: 'KG' });
    fetchServices();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Services & Pricing</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Service name (e.g. Wash & Fold)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div className="flex gap-3">
            <input type="number" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
              placeholder="Price per unit"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <select value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="KG">per kg</option>
              <option value="PIECE">per piece</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Service'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{s.name}</p>
              <p className="text-sm text-gray-500">₹{s.pricePerUnit} per {s.unitType === 'KG' ? 'kg' : 'piece'}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {s.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
