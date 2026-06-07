'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Package, IndianRupee } from 'lucide-react';
import { deliveryApi } from '@/lib/api';

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<any>(null);

  useEffect(() => {
    deliveryApi.getEarnings().then((res) => setEarnings(res.data));
  }, []);

  if (!earnings) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 px-4 pt-12 pb-8">
        <h1 className="text-xl font-bold text-white mb-1">Earnings</h1>
        <p className="text-blue-100 text-sm">₹{earnings.payPerDelivery} per delivery</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <IndianRupee size={20} className="text-blue-600" />
            <p className="text-sm text-gray-500">Total Earnings</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{earnings.totalEarnings}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-green-500" />
              <p className="text-xs text-gray-500">Today</p>
            </div>
            <p className="text-xl font-bold">₹{earnings.todayEarnings}</p>
            <p className="text-xs text-gray-400">{earnings.todayDeliveries} deliveries</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-blue-500" />
              <p className="text-xs text-gray-500">This Week</p>
            </div>
            <p className="text-xl font-bold">₹{earnings.weekEarnings}</p>
            <p className="text-xs text-gray-400">{earnings.weekDeliveries} deliveries</p>
          </div>
        </div>
      </div>
    </div>
  );
}
