'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Order { id: string; status: string; totalAmount: number; customer: { name: string } }

const NEXT: Record<string, string> = {
  PLACED: 'ACCEPTED', ACCEPTED: 'PICKED_UP', PICKED_UP: 'IN_PROGRESS',
  IN_PROGRESS: 'READY',
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { api.get<Order[]>('/orders?role=vendor').then(setOrders).catch(() => {}); }, []);

  async function advance(orderId: string, nextStatus: string) {
    await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>
      <div className="space-y-3 max-w-2xl">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold">{o.customer.name}</p>
              <p className="text-sm text-gray-500">#{o.id.slice(-6).toUpperCase()} · ₹{o.totalAmount}</p>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                {o.status.replace(/_/g, ' ')}
              </span>
            </div>
            {NEXT[o.status] && (
              <button onClick={() => advance(o.id, NEXT[o.status])}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                → {NEXT[o.status].replace(/_/g, ' ')}
              </button>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-400 text-center py-12">No orders.</p>}
      </div>
    </>
  );
}
