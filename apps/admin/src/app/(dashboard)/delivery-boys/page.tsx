'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { adminApi } from '@/lib/api';
import { CheckCircle, Circle } from 'lucide-react';

export default function DeliveryBoysPage() {
  const [dbs, setDbs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDBs = () => {
    setLoading(true);
    adminApi.getDeliveryBoys({})
      .then((res) => { setDbs(res.data.data); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchDBs, []);

  const handleApprove = async (id: string) => {
    await adminApi.approveDeliveryBoy(id);
    fetchDBs();
  };

  return (
    <div>
      <Header title="Delivery Boys" />
      <div className="p-6 space-y-4">
        <span className="text-sm text-gray-500">{total} delivery boys</span>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vendor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : dbs.map((db) => (
                <tr key={db.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{db.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{db.user?.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{db.vendor?.shopName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{db.vehicleType}</span>
                  </td>
                  <td className="px-4 py-3">
                    {db.isAvailable ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle size={14} /> On Duty
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Circle size={14} /> Off Duty
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!db.isApproved && (
                      <button
                        onClick={() => handleApprove(db.id)}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100"
                      >
                        Approve KYC
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
