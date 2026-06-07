'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Vendor { id: string; shopName: string; isApproved: boolean; isSuspended: boolean; rating: number; user: { phone: string } }

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => { api.get<Vendor[]>('/admin/vendors').then(setVendors).catch(() => {}); }, []);

  async function toggle(id: string, action: 'approve' | 'suspend') {
    await api.patch(`/admin/vendors/${id}/${action}`, {});
    setVendors((prev) => prev.map((v) => v.id === id
      ? { ...v, isApproved: action === 'approve' ? true : v.isApproved, isSuspended: action === 'suspend' ? !v.isSuspended : false }
      : v));
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Vendors</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Shop','Phone','Rating','Status','Actions'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{v.shopName}</td>
                <td className="px-4 py-3 text-gray-500">{v.user.phone}</td>
                <td className="px-4 py-3">⭐ {v.rating.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${v.isSuspended ? 'bg-red-100 text-red-700' : v.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {v.isSuspended ? 'Suspended' : v.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {!v.isApproved && <button onClick={() => toggle(v.id, 'approve')} className="text-xs text-green-600 hover:underline">Approve</button>}
                  <button onClick={() => toggle(v.id, 'suspend')} className={`text-xs hover:underline ${v.isSuspended ? 'text-blue-600' : 'text-red-600'}`}>
                    {v.isSuspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
