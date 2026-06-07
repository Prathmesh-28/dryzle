'use client';

import { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import VendorCard from '@/components/VendorCard';
import ActiveOrderBanner from '@/components/ActiveOrderBanner';
import { customerApi } from '@/lib/api';

export default function HomePage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          customerApi.getNearbyVendors(pos.coords.latitude, pos.coords.longitude)
            .then((res) => setVendors(res.data))
            .finally(() => setLoading(false));
        },
        () => {
          // Fallback: default coords (Mumbai)
          customerApi.getNearbyVendors(19.076, 72.8777)
            .then((res) => setVendors(res.data))
            .finally(() => setLoading(false));
        },
      );
    }
  }, []);

  const filtered = vendors.filter((v) =>
    v.shopName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-2 text-white mb-4">
          <MapPin size={16} />
          <span className="text-sm font-medium">Detecting location…</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Laundry at your<br />doorstep
        </h1>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none"
          />
        </div>
      </div>

      <ActiveOrderBanner />

      <div className="px-4 py-4">
        <h2 className="font-semibold text-gray-800 mb-3">Nearby Vendors</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No vendors found in your area.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((v) => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
