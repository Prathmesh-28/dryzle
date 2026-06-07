'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DB { id: string; user: { name: string; phone: string }; vehicleType: string; isApproved: boolean; isAvailable: boolean }

export default function AdminDeliveryBoys() {
  const [dbs, setDbs] = useState<DB[]>([]);

  useEffect(() => { api.get<DB[]>('/admin/delivery-boys').then(setDbs).catch(() => {}); }, []);

  async function approveKyc(id: string) {
    await api.patch(`/admin/delivery-boys/${id}/approve`, {});
    setDbs((prev) => prev.map((d) => d.id === id ? { ...d, isApproved: true } : d));
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Delivery Boys</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Name','Phone','Vehicle','Status','Action'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dbs.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{d.user.name}</td>
                <td className="px-4 py-3 text-gray-500">{d.user.phone}</td>
                <td className="px-4 py-3">{d.vehicleType}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${d.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {d.isApproved ? (d.isAvailable ? 'Online' : 'Offline') : 'KYC Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!d.isApproved && (
                    <button onClick={() => approveKyc(d.id)} className="text-xs text-green-600 hover:underline">Approve KYC</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
