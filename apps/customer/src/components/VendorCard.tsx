import Link from 'next/link';
import { Star, Clock, MapPin } from 'lucide-react';

interface Props {
  vendor: {
    id: string;
    shopName: string;
    address: string;
    rating: number;
    reviewCount: number;
    isOpen: boolean;
    distanceKm?: number;
    services?: { name: string; pricePerUnit: number; unitType: string }[];
  };
}

export default function VendorCard({ vendor }: Props) {
  return (
    <Link href={`/vendors/${vendor.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">{vendor.shopName}</h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              vendor.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {vendor.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            {vendor.rating.toFixed(1)} ({vendor.reviewCount})
          </span>
          {vendor.distanceKm !== undefined && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {vendor.distanceKm.toFixed(1)} km
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={14} />
            ~2 days
          </span>
        </div>

        {vendor.services && vendor.services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vendor.services.slice(0, 3).map((s) => (
              <span key={s.name} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {s.name} • ₹{s.pricePerUnit}/{s.unitType === 'KG' ? 'kg' : 'pc'}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
