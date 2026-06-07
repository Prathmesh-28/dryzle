'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  gmvToday: number; gmvWeek: number; gmvMonth: number;
  ordersToday: number; activeVendors: number; activeDeliveryBoys: number; newUsersToday: number;
  weeklyRevenue: { day: string; revenue: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { api.get<Stats>('/admin/dashboard').then(setStats).catch(() => {}); }, []);

  const cards = [
    { label: 'GMV Today', value: stats ? `₹${stats.gmvToday.toLocaleString()}` : '–' },
    { label: 'GMV This Week', value: stats ? `₹${stats.gmvWeek.toLocaleString()}` : '–' },
    { label: 'GMV This Month', value: stats ? `₹${stats.gmvMonth.toLocaleString()}` : '–' },
    { label: 'Orders Today', value: stats?.ordersToday ?? '–' },
    { label: 'Active Vendors', value: stats?.activeVendors ?? '–' },
    { label: 'Active DBs', value: stats?.activeDeliveryBoys ?? '–' },
    { label: 'New Users Today', value: stats?.newUsersToday ?? '–' },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      {stats?.weeklyRevenue && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.weeklyRevenue}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
