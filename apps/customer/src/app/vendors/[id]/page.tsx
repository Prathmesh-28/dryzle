'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import { customerApi } from '@/lib/api';

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    customerApi.getVendor(id as string).then((res) => setVendor(res.data));
  }, [id]);

  const cartTotal = vendor?.services?.reduce((sum: number, s: any) => {
    return sum + (cart[s.id] ?? 0) * s.pricePerUnit;
  }, 0) ?? 0;

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const adjust = (serviceId: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev, [serviceId]: Math.max(0, (prev[serviceId] ?? 0) + delta) };
      if (next[serviceId] === 0) delete next[serviceId];
      return next;
    });
  };

  const handleCheckout = () => {
    localStorage.setItem('cart', JSON.stringify({ vendorId: id, items: cart, subtotal: cartTotal }));
    router.push('/cart');
  };

  if (!vendor) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-white mb-4 flex items-center gap-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">{vendor.shopName}</h1>
        <div className="flex items-center gap-3 text-blue-100 text-sm mt-1">
          <span className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            {vendor.rating.toFixed(1)} ({vendor.reviewCount} reviews)
          </span>
          <span className={vendor.isOpen ? 'text-green-300' : 'text-red-300'}>
            {vendor.isOpen ? '● Open' : '● Closed'}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <h2 className="font-semibold text-gray-800">Services</h2>
        {vendor.services?.map((s: any) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{s.name}</p>
              <p className="text-sm text-gray-500">
                ₹{s.pricePerUnit} per {s.unitType === 'KG' ? 'kg' : 'piece'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(cart[s.id] ?? 0) > 0 && (
                <>
                  <button onClick={() => adjust(s.id, -1)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Minus size={16} />
                  </button>
                  <span className="w-5 text-center font-medium">{cart[s.id]}</span>
                </>
              )}
              <button onClick={() => adjust(s.id, 1)} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4">
          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-between px-5 shadow-lg"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={20} />
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
            <span className="font-bold">₹{cartTotal} →</span>
          </button>
        </div>
      )}
    </div>
  );
}
