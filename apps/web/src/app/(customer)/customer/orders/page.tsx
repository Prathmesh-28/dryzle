'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Order { id: string; status: string; totalAmount: number; createdAt: string }

const STATUS_COLOR: Record<string, string> = {
  PLACED: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  READY: 'bg-green-100 text-green-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { api.get<Order[]>('/orders/my').then(setOrders); }, []);

  return (
    <>
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/customer/orders/${o.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">#{o.id.slice(-6).toUpperCase()}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[o.status] ?? 'bg-gray-100'}`}>
                  {o.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="font-semibold">₹{o.totalAmount}</span>
                <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
