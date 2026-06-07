'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { adminApi } from '@/lib/api';
import { CheckCircle, XCircle, Star } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [loading, setLoading] = useState(true);

  const fetchVendors = () => {
    setLoading(true);
    const params: Record<string, unknown> = { page };
    if (filter === 'pending') params.approved = false;
    if (filter === 'approved') params.approved = true;
    adminApi.getVendors(params)
      .then((res) => { setVendors(res.data.data); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchVendors, [page, filter]);

  const handleApprove = async (id: string) => {
    await adminApi.approveVendor(id);
    fetchVendors();
  };

  const handleSuspend = async (id: string) => {
    await adminApi.suspendVendor(id);
    fetchVendors();
  };

  return (
    <div>
      <Header title="Vendors" />
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500 self-center">{total} vendors</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Shop</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Owner</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Rating</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              ) : vendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{v.shopName}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{v.address}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{v.user?.name}</p>
                    <p className="text-xs text-gray-400">{v.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      {v.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.isApproved ? (
                      <span className="text-green-600 flex items-center gap-1 text-xs font-medium">
                        <CheckCircle size={14} /> Approved
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-xs font-medium">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!v.isApproved && (
                        <button
                          onClick={() => handleApprove(v.id)}
                          className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100"
                        >
                          Approve
                        </button>
                      )}
                      {v.isActive && (
                        <button
                          onClick={() => handleSuspend(v.id)}
                          className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
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
