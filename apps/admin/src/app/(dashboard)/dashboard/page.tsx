'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ShoppingBag, Store, Truck, Users, TrendingUp, AlertCircle, CheckCircle, XCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/ui/StatsCard';
import { adminApi } from '@/lib/api';

interface Stats {
  gmvToday: number;
  gmvWeek: number;
  gmvMonth: number;
  ordersToday: number;
  activeOrders: number;
  cancelledToday: number;
  vendorCount: number;
  activeVendors: number;
  deliveryBoyCount: number;
  onDutyDeliveryBoys: number;
  newUsersThisWeek: number;
}

const mockWeeklyRevenue = [
  { day: 'Mon', revenue: 12400 },
  { day: 'Tue', revenue: 15800 },
  { day: 'Wed', revenue: 11200 },
  { day: 'Thu', revenue: 18900 },
  { day: 'Fri', revenue: 22100 },
  { day: 'Sat', revenue: 28400 },
  { day: 'Sun', revenue: 19600 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
      ? `₹${(n / 1000).toFixed(1)}K`
      : `₹${n}`;

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard label="GMV Today" value={fmt(stats.gmvToday)} icon={TrendingUp} color="blue" />
              <StatsCard label="Orders Today" value={stats.ordersToday} icon={ShoppingBag} color="green" />
              <StatsCard label="Active Orders" value={stats.activeOrders} icon={CheckCircle} color="yellow" />
              <StatsCard label="Cancelled Today" value={stats.cancelledToday} icon={XCircle} color="red" />
              <StatsCard label="Active Vendors" value={`${stats.activeVendors}/${stats.vendorCount}`} icon={Store} color="purple" />
              <StatsCard label="DBs On Duty" value={`${stats.onDutyDeliveryBoys}/${stats.deliveryBoyCount}`} icon={Truck} color="blue" />
              <StatsCard label="New Users (7d)" value={stats.newUsersThisWeek} icon={Users} color="green" />
              <StatsCard label="GMV This Month" value={fmt(stats.gmvMonth)} icon={TrendingUp} color="yellow" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Weekly Revenue</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mockWeeklyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle size={18} /> Failed to load dashboard data
          </div>
        )}
      </div>
    </div>
  );
}
