'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { customerApi } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  ACCEPTED: 'Vendor Accepted',
  PICKED_UP: 'Picked Up',
  AT_VENDOR: 'At Laundry',
  PROCESSING: 'Being Washed',
  READY: 'Ready for Delivery',
  OUT_FOR_DELIVERY: 'Out for Delivery',
};

export default function ActiveOrderBanner() {
  const [activeOrder, setActiveOrder] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    customerApi.getOrders(1).then((res) => {
      const orders = res.data.data as { id: string; status: string }[];
      const active = orders.find((o) => Object.keys(STATUS_LABELS).includes(o.status));
      setActiveOrder(active ?? null);
    }).catch(() => null);
  }, []);

  if (!activeOrder) return null;

  return (
    <Link href={`/orders/${activeOrder.id}`}>
      <div className="bg-blue-600 text-white mx-4 mt-2 rounded-xl p-3 flex items-center gap-3">
        <Package size={20} />
        <div className="flex-1">
          <p className="text-xs opacity-80">Active Order</p>
          <p className="font-medium text-sm">{STATUS_LABELS[activeOrder.status]}</p>
        </div>
        <ChevronRight size={18} />
      </div>
    </Link>
  );
}
