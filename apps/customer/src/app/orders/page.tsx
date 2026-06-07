'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { customerApi } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'text-blue-600 bg-blue-50',
  ACCEPTED: 'text-cyan-600 bg-cyan-50',
  PROCESSING: 'text-purple-600 bg-purple-50',
  READY: 'text-indigo-600 bg-indigo-50',
  OUT_FOR_DELIVERY: 'text-teal-600 bg-teal-50',
  DELIVERED: 'text-green-600 bg-green-50',
  CANCELLED: 'text-red-600 bg-red-50',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi.getOrders().then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No orders yet</p>
        ) : orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{order.vendor?.shopName}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {format(new Date(order.createdAt), 'dd MMM, hh:mm a')}
                </p>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${STATUS_COLORS[order.status] ?? ''}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
