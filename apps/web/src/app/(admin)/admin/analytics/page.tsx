'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Analytics {
  retention: { label: string; rate: number }[];
  serviceBreakdown: { name: string; value: number }[];
}

const COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe'];

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => { api.get<Analytics>('/admin/analytics').then(setData).catch(() => {}); }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">User Retention</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.retention ?? []}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Retention']} />
              <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Service Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data?.serviceBreakdown ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {(data?.serviceBreakdown ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
