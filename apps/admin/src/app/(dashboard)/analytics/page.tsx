'use client';

import Header from '@/components/layout/Header';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const retentionData = [
  { cohort: 'Week 1', d1: 82, d7: 54, d30: 31 },
  { cohort: 'Week 2', d1: 78, d7: 49, d30: 28 },
  { cohort: 'Week 3', d1: 85, d7: 61, d30: 35 },
  { cohort: 'Week 4', d1: 80, d7: 57, d30: 33 },
];

const serviceData = [
  { name: 'Wash & Fold', value: 48 },
  { name: 'Dry Clean', value: 27 },
  { name: 'Ironing', value: 25 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

export default function AnalyticsPage() {
  return (
    <div>
      <Header title="Analytics" />
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Customer Retention (D1 / D7 / D30)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="cohort" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="d1" name="D1" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="d7" name="D7" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="d30" name="D30" stroke="#10b981" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Services by Volume</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={serviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {serviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Peak Order Hours</h3>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 24 }, (_, h) => {
                const intensity = Math.random();
                const bg =
                  intensity > 0.7 ? 'bg-blue-600' :
                  intensity > 0.4 ? 'bg-blue-300' :
                  'bg-blue-100';
                return (
                  <div key={h} className="text-center">
                    <div className={`h-8 rounded ${bg}`} title={`${h}:00`} />
                    <p className="text-xs text-gray-400 mt-1">{h}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">Darker = higher order volume</p>
          </div>
        </div>
      </div>
    </div>
  );
}
