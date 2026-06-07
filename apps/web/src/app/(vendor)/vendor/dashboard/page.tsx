'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats { todayOrders: number; todayRevenue: number; pendingOrders: number; rating: number }

export default function VendorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { api.get<Stats>('/vendors/me/stats').then(setStats).catch(() => {}); }, []);

  const cards = [
    { label: "Today's Orders", value: stats?.todayOrders ?? '–' },
    { label: "Today's Revenue", value: stats ? `₹${stats.todayRevenue}` : '–' },
    { label: 'Pending', value: stats?.pendingOrders ?? '–' },
    { label: 'Rating', value: stats ? `${stats.rating.toFixed(1)} ⭐` : '–' },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
