'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  pricePerUnit: number;
  unit: string;
}

export default function VendorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.get<Service[]>(`/vendors/${id}/services`).then(setServices);
  }, [id]);

  function adjust(serviceId: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev, [serviceId]: Math.max(0, (prev[serviceId] ?? 0) + delta) };
      if (!next[serviceId]) delete next[serviceId];
      return next;
    });
  }

  const total = services.reduce((sum, s) => sum + (cart[s.id] ?? 0) * s.pricePerUnit, 0);

  async function placeOrder() {
    setPlacing(true);
    try {
      const items = Object.entries(cart).map(([serviceId, qty]) => ({ serviceId, quantity: qty }));
      const order = await api.post<{ id: string }>('/orders', { vendorId: id, items });
      router.push(`/customer/orders/${order.id}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="pb-24">
      <h2 className="text-xl font-bold mb-4">Services</h2>
      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-gray-500">₹{s.pricePerUnit} / {s.unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => adjust(s.id, -1)} className="w-7 h-7 rounded-full border text-lg leading-none">−</button>
              <span className="w-5 text-center text-sm font-semibold">{cart[s.id] ?? 0}</span>
              <button onClick={() => adjust(s.id, 1)} className="w-7 h-7 rounded-full bg-indigo-600 text-white text-lg leading-none">+</button>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="fixed bottom-4 left-0 right-0 max-w-lg mx-auto px-4">
          <button
            onClick={placeOrder}
            disabled={placing}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold shadow-lg disabled:opacity-50"
          >
            {placing ? 'Placing…' : `Place Order · ₹${total}`}
          </button>
        </div>
      )}
    </div>
  );
}
