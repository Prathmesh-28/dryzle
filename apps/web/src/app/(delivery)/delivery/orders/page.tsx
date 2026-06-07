'use client';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { startLocationSharing } from '@/lib/socket';

interface Order { id: string; status: string; totalAmount: number; vendor: { shopName: string }; customer: { name: string } }

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [available, setAvailable] = useState(true);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => { api.get<Order[]>('/delivery/my-orders').then(setOrders).catch(() => {}); }, []);

  async function toggleAvailability() {
    await api.patch('/delivery/availability', { isAvailable: !available });
    setAvailable(!available);
  }

  async function startDelivery(orderId: string) {
    await api.patch(`/orders/${orderId}/status`, { status: 'OUT_FOR_DELIVERY' });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'OUT_FOR_DELIVERY' } : o));
    stopRef.current = startLocationSharing(orderId);
  }

  async function markDelivered(orderId: string) {
    await api.patch(`/orders/${orderId}/status`, { status: 'DELIVERED' });
    stopRef.current?.();
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">My Orders</h2>
        <button onClick={toggleAvailability}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {available ? 'Available' : 'Offline'}
        </button>
      </div>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="font-semibold">{o.vendor.shopName}</p>
            <p className="text-sm text-gray-500">For {o.customer.name} · ₹{o.totalAmount}</p>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
              {o.status.replace(/_/g, ' ')}
            </span>
            <div className="mt-3 flex gap-2">
              {o.status === 'READY' && (
                <button onClick={() => startDelivery(o.id)}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm">
                  Start Delivery
                </button>
              )}
              {o.status === 'OUT_FOR_DELIVERY' && (
                <button onClick={() => markDelivered(o.id)}
                  className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm">
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-400 text-center py-12">No assigned orders.</p>}
      </div>
    </>
  );
}
