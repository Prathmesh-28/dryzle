'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Order { id: string; status: string; totalAmount: number; createdAt: string; customer: { name: string }; vendor: { shopName: string } }

const STATUSES = ['ALL','PLACED','ACCEPTED','PICKED_UP','IN_PROGRESS','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { api.get<Order[]>('/admin/orders').then(setOrders).catch(() => {}); }, []);

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <div className="flex gap-2 flex-wrap mb-4">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${filter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-200'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Order','Customer','Vendor','Amount','Status','Date'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3">{o.customer.name}</td>
                <td className="px-4 py-3">{o.vendor.shopName}</td>
                <td className="px-4 py-3 font-semibold">₹{o.totalAmount}</td>
                <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{o.status.replace(/_/g, ' ')}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No orders.</p>}
      </div>
    </>
  );
}
