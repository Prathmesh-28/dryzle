'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Vendor {
  id: string;
  shopName: string;
  address: string;
  rating: number;
  distanceKm: number;
  isOpen: boolean;
}

export default function CustomerHome() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await api.get<Vendor[]>(
            `/vendors/nearby?lat=${coords.latitude}&lng=${coords.longitude}&radiusKm=10`,
          );
          setVendors(data);
        } finally {
          setLoading(false);
        }
      },
      () => setLoading(false),
    );
  }, []);

  const filtered = vendors.filter((v) =>
    v.shopName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <h2 className="text-xl font-bold mb-3">Nearby Laundries</h2>
      <input
        type="text"
        placeholder="Search shops…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      {loading ? (
        <p className="text-gray-400 text-center py-12">Fetching nearby shops…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No shops found nearby.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <Link
              key={v.id}
              href={`/customer/vendors/${v.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{v.shopName}</h3>
                  <p className="text-sm text-gray-500">{v.address}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    v.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {v.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>⭐ {v.rating.toFixed(1)}</span>
                <span>📍 {v.distanceKm.toFixed(1)} km</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
