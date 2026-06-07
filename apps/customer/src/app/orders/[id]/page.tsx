'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Circle, Phone } from 'lucide-react';
import { customerApi } from '@/lib/api';
import { joinOrderRoom, onOrderStatus, onLocationUpdate } from '@/lib/socket';
import { format } from 'date-fns';

const STEPS = [
  'PLACED', 'ACCEPTED', 'PICKED_UP', 'AT_VENDOR', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED',
];

const STEP_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  ACCEPTED: 'Accepted by Vendor',
  PICKED_UP: 'Picked Up from You',
  AT_VENDOR: 'At Laundry',
  PROCESSING: 'Being Processed',
  READY: 'Ready for Delivery',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    customerApi.getOrder(id as string).then((res) => setOrder(res.data));
    joinOrderRoom(id as string);

    const cleanStatus = onOrderStatus(({ status }) => {
      setOrder((prev: any) => (prev ? { ...prev, status } : prev));
    });
    const cleanLocation = onLocationUpdate((data) => {
      setOrder((prev: any) => (prev ? { ...prev, dbLocation: data } : prev));
    });

    return () => { cleanStatus(); cleanLocation(); };
  }, [id]);

  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <button onClick={() => router.back()} className="text-white mb-4"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold text-white">Order #{order.id.slice(-8)}</h1>
        <p className="text-blue-100 text-sm">{order.vendor?.shopName}</p>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Order Status</h2>
          <div className="space-y-4">
            {STEPS.filter((s) => s !== 'CANCELLED').map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle size={20} className={active ? 'text-blue-600' : 'text-green-500'} />
                  ) : (
                    <Circle size={20} className="text-gray-300" />
                  )}
                  <div>
                    <p className={`font-medium text-sm ${done ? (active ? 'text-blue-600' : 'text-gray-700') : 'text-gray-400'}`}>
                      {STEP_LABELS[step]}
                    </p>
                    {order.statusLogs?.find((l: any) => l.status === step) && (
                      <p className="text-xs text-gray-400">
                        {format(new Date(order.statusLogs.find((l: any) => l.status === step).timestamp), 'hh:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Items</h2>
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-700">{item.service?.name} × {item.quantity}</span>
              <span className="font-medium">₹{item.subtotal}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-900 mt-3 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        {order.deliveryBoy && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Delivery Partner</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.deliveryBoy.user?.name}</p>
                <p className="text-sm text-gray-500">{order.deliveryBoy.vehicleType}</p>
              </div>
              <a
                href={`tel:${order.deliveryBoy.user?.phone}`}
                className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
