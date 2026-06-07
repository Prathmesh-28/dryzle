'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Earnings { today: number; week: number; month: number; totalDeliveries: number }

export default function DeliveryEarnings() {
  const [data, setData] = useState<Earnings | null>(null);

  useEffect(() => { api.get<Earnings>('/delivery/earnings').then(setData).catch(() => {}); }, []);

  const cards = [
    { label: 'Today', value: data ? `₹${data.today}` : '–' },
    { label: 'This Week', value: data ? `₹${data.week}` : '–' },
    { label: 'This Month', value: data ? `₹${data.month}` : '–' },
    { label: 'Total Deliveries', value: data?.totalDeliveries ?? '–' },
  ];

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Earnings</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
