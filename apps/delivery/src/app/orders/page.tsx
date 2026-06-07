'use client';

import { useEffect, useState } from 'react';
import { MapPin, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { deliveryApi } from '@/lib/api';
import { startLocationSharing } from '@/lib/socket';

const NEXT: Record<string, string> = {
  READY: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [available, setAvailable] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([deliveryApi.getOrders(), deliveryApi.getProfile()])
      .then(([ordersRes, profileRes]) => {
        setOrders(ordersRes.data);
        setProfile(profileRes.data);
        setAvailable(profileRes.data.isAvailable);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const toggleAvail = async () => {
    await deliveryApi.toggleAvailability();
    setAvailable((v) => !v);
  };

  const advance = async (orderId: string, dbId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const nextStatus = NEXT[order.status];
    if (!nextStatus) return;

    if (nextStatus === 'OUT_FOR_DELIVERY') {
      const stop = startLocationSharing(orderId, dbId);
      window.addEventListener('beforeunload', stop);
    }

    await deliveryApi.updateOrderStatus(orderId, nextStatus);
    fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <h1 className="text-xl font-bold text-white">My Deliveries</h1>
        <button onClick={toggleAvail} className="flex items-center gap-2 mt-3 bg-white/20 rounded-xl px-4 py-2">
          {available ? <ToggleRight size={24} className="text-green-300" /> : <ToggleLeft size={24} className="text-white/60" />}
          <span className="text-white text-sm font-medium">{available ? 'On Duty' : 'Off Duty'}</span>
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p>No active deliveries</p>
          </div>
        ) : orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900">#{order.id.slice(-8)}</p>
                <p className="text-sm text-gray-500">{order.vendor?.shopName}</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-blue-500 shrink-0" />
                <span>{order.customer?.name} — {order.vendor?.address}</span>
              </div>
            </div>

            {NEXT[order.status] && (
              <button
                onClick={() => advance(order.id, profile?.id)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Mark {NEXT[order.status].replace(/_/g, ' ')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
