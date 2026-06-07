'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { joinOrderRoom, leaveOrderRoom, onOrderStatus, onLocationUpdate } from '@/lib/socket';
import { useParams } from 'next/navigation';

const STEPS = ['PLACED','ACCEPTED','PICKED_UP','IN_PROGRESS','READY','OUT_FOR_DELIVERY','DELIVERED'];

interface Order {
  id: string; status: string; totalAmount: number;
  vendor: { shopName: string };
  deliveryBoy?: { user: { name: string; phone: string } };
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    api.get<Order>(`/orders/${id}`).then(setOrder);
    joinOrderRoom(id);
    const offStatus = onOrderStatus((d: unknown) => {
      const data = d as { status: string };
      setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
    });
    const offLoc = onLocationUpdate(() => {});
    return () => { leaveOrderRoom(id); offStatus(); offLoc(); };
  }, [id]);

  if (!order) return <p className="text-center py-12 text-gray-400">Loading…</p>;

  const stepIdx = STEPS.indexOf(order.status);

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{order.vendor.shopName}</h2>
      <p className="text-gray-500 text-sm mb-6">Order #{order.id.slice(-6).toUpperCase()} · ₹{order.totalAmount}</p>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Status</h3>
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${i <= stepIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <span className={`text-sm ${i === stepIdx ? 'font-semibold text-indigo-700' : i < stepIdx ? 'text-gray-400 line-through' : 'text-gray-400'}`}>
              {s.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>

      {order.deliveryBoy && (
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <p className="font-medium">{order.deliveryBoy.user.name}</p>
            <p className="text-sm text-gray-500">Delivery partner</p>
          </div>
          <a href={`tel:${order.deliveryBoy.user.phone}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
            Call
          </a>
        </div>
      )}
    </div>
  );
}
