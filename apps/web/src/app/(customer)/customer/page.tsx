"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, MapPin, Star, WashingMachine, Loader2,
  Clock, ChevronRight, Zap, Bell, ShoppingBag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Vendor {
  id: string;
  shopName?: string;
  name?: string;
  address?: string;
  distanceKm?: number;
  distance?: number;
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  status?: string;
  deliveryTime?: string;
}

interface ActiveOrder { id: string; orderNumber?: string; status: string; }

const OFFERS = [
  { label: "20% OFF", sub: "First order", from: "from-violet-500", to: "to-indigo-600" },
  { label: "Free Pickup", sub: "Orders above ₹299", from: "from-emerald-500", to: "to-teal-600" },
  { label: "Express 12h", sub: "Premium plan", from: "from-orange-500", to: "to-rose-500" },
];

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Order Placed",
  ACCEPTED: "Accepted by Shop",
  PICKED_UP: "Picked Up",
  IN_PROGRESS: "Being Cleaned",
  READY: "Ready for Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

export default function CustomerHome() {
  const [vendors, setVendors] = useState<Vendor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [offerIdx, setOfferIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setOfferIdx((i) => (i + 1) % OFFERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setCoords({ lat: 19.076, lng: 72.8777 }); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords({ lat: 19.076, lng: 72.8777 }),
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    apiGet<Vendor[] | { vendors: Vendor[] }>("/vendors/nearby", { lat: coords.lat, lng: coords.lng, radiusKm: 10 })
      .then((d) => setVendors(Array.isArray(d) ? d : (d?.vendors ?? [])))
      .catch(() => setErr("Could not load nearby laundries"))
      .finally(() => setLoading(false));
    apiGet<{ orders: ActiveOrder[] }>("/orders/my?limit=1&active=true")
      .then((d) => setActiveOrder(d?.orders?.[0] ?? null))
      .catch(() => null);
  }, [coords]);

  const filtered = useMemo(() => {
    if (!vendors) return [];
    if (!q) return vendors;
    return vendors.filter((v) =>
      (v.shopName || v.name || "").toLowerCase().includes(q.toLowerCase()),
    );
  }, [vendors, q]);

  const offer = OFFERS[offerIdx];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white px-4 pt-12 pb-7 relative overflow-hidden">
        <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-md mx-auto">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-white/70 text-xs font-medium">Delivering to</p>
              <p className="font-semibold text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {coords ? "Your location" : "Detecting…"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur grid place-items-center">
                <Bell className="w-4 h-4" />
              </button>
              <Link href="/customer/orders">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur grid place-items-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-0.5">Good morning 👋</h1>
          <p className="text-white/70 text-sm mb-4">Fresh laundry, at your door.</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search laundries near you…"
              className="pl-9 h-11 bg-white text-gray-900 rounded-xl border-0 shadow-lg placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">

        {/* Active Order Banner */}
        {activeOrder && (
          <Link href={`/customer/orders/${activeOrder.id}`}>
            <div className="bg-indigo-600 text-white rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center shrink-0">
                <WashingMachine className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/70">Active Order · #{(activeOrder.orderNumber || activeOrder.id.slice(-6)).toUpperCase()}</p>
                <p className="font-semibold text-sm">{STATUS_LABEL[activeOrder.status] || activeOrder.status}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
            </div>
          </Link>
        )}

        {/* Offer Banner */}
        <div className={`bg-gradient-to-r ${offer.from} ${offer.to} text-white rounded-2xl p-4 mb-5 flex items-center justify-between shadow-md`}>
          <div>
            <p className="text-xs text-white/80">{offer.sub}</p>
            <p className="text-xl font-extrabold">{offer.label}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex gap-1">
              {OFFERS.map((_, i) => (
                <div key={i} className={cn("w-1.5 h-1.5 rounded-full bg-white transition-opacity", i === offerIdx ? "opacity-100" : "opacity-40")} />
              ))}
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">Nearby Laundries</h2>
          {!loading && vendors && (
            <p className="text-xs text-muted-foreground">{filtered.length} found</p>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-4 shadow-sm animate-pulse flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-2/3 bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : err ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-50 grid place-items-center mb-3">
              <WashingMachine className="w-8 h-8 text-red-300" />
            </div>
            <p className="text-sm text-muted-foreground">{err}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 grid place-items-center mb-4">
              <WashingMachine className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="font-semibold text-sm">No laundries found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try a different search or expand your area</p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {filtered.map((v) => {
              const open = v.isOpen ?? (v.status ? v.status === "OPEN" : true);
              const dist = v.distanceKm ?? v.distance;
              return (
                <Link key={v.id} href={`/customer/vendors/${v.id}`}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition active:scale-[0.99] flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 grid place-items-center shrink-0">
                      <WashingMachine className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{v.shopName || v.name}</h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0",
                          open ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-500",
                        )}>
                          {open ? "Open" : "Closed"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.address || "—"}</p>
                      <div className="flex items-center gap-3 mt-2.5">
                        {typeof v.rating === "number" && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {v.rating.toFixed(1)}
                            {v.reviewCount ? <span className="text-muted-foreground font-normal">({v.reviewCount})</span> : null}
                          </span>
                        )}
                        {typeof dist === "number" && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />{dist.toFixed(1)} km
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                          <Clock className="w-3 h-3" />{v.deliveryTime || "24h"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!coords && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Detecting your location…
          </div>
        )}
      </div>
    </div>
  );
}
