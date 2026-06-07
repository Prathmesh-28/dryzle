'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { vendorApi } from '@/lib/api';

const NEXT_STATUS: Record<string, string> = {
  PLACED: 'ACCEPTED',
  ACCEPTED: 'PICKED_UP',
  PICKED_UP: 'AT_VENDOR',
  AT_VENDOR: 'PROCESSING',
  PROCESSING: 'READY',
  READY: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-cyan-100 text-cyan-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  READY: 'bg-indigo-100 text-indigo-700',
  OUT_FOR_DELIVERY: 'bg-teal-100 text-teal-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    vendorApi.getOrders().then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(fetchOrders, []);

  const advance = async (orderId: string, status: string) => {
    await vendorApi.updateOrderStatus(orderId, status);
    fetchOrders();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <button onClick={fetchOrders} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{order.customer?.name}</p>
                  <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'dd MMM, hh:mm a')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? ''}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {order.items?.map((item: any) => (
                  <span key={item.id} className="mr-2">{item.service?.name} ×{item.quantity}</span>
                ))}
              </div>

              {NEXT_STATUS[order.status] && order.status !== 'OUT_FOR_DELIVERY' && (
                <button
                  onClick={() => advance(order.id, NEXT_STATUS[order.status])}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Mark as {NEXT_STATUS[order.status].replace(/_/g, ' ')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
