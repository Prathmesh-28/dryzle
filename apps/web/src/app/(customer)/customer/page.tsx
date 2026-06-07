"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Star, WashingMachine, Loader2 } from "lucide-react";
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
  isOpen?: boolean;
  status?: string;
}

export default function CustomerHome() {
  const [vendors, setVendors] = useState<Vendor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords({ lat: 19.076, lng: 72.8777 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords({ lat: 19.076, lng: 72.8777 }),
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    apiGet<Vendor[] | { vendors: Vendor[] }>("/vendors/nearby", {
      lat: coords.lat,
      lng: coords.lng,
      radiusKm: 10,
    })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.vendors ?? []);
        setVendors(list);
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { message?: string } } };
        setErr(err?.response?.data?.message || "Could not load nearby laundries");
      })
      .finally(() => setLoading(false));
  }, [coords]);

  const filtered = useMemo(() => {
    if (!vendors) return [];
    if (!q) return vendors;
    return vendors.filter((v) =>
      (v.shopName || v.name || "").toLowerCase().includes(q.toLowerCase()),
    );
  }, [vendors, q]);

  return (
    <div className="max-w-md mx-auto">
      <header className="sticky top-0 z-30 bg-gradient-to-b from-indigo-600 to-indigo-500 text-white px-4 pt-6 pb-5 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-white/80">Delivering to</p>
            <p className="text-sm font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {coords ? "Your location" : "Detecting..."}
            </p>
          </div>
          <div className="text-xl font-extrabold tracking-tight">Dryzle</div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search laundries..."
            className="pl-9 bg-white text-foreground"
          />
        </div>
      </header>

      <main className="px-4 pt-5">
        <h2 className="text-lg font-semibold mb-3">Nearby laundries</h2>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-card p-4 shadow-sm animate-pulse">
                <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                <div className="h-3 w-1/2 bg-muted rounded mb-3" />
                <div className="h-3 w-1/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : err ? (
          <div className="text-center py-12 text-sm text-destructive">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <WashingMachine className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold">No laundries nearby</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try expanding your search radius
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((v) => {
              const open = v.isOpen ?? (v.status ? v.status === "OPEN" : true);
              const dist = v.distanceKm ?? v.distance;
              return (
                <Link
                  key={v.id}
                  href={`/customer/vendors/${v.id}`}
                  className="block rounded-2xl bg-card p-4 shadow-sm hover:shadow-md transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{v.shopName || v.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {v.address || "—"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
                        open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700",
                      )}
                    >
                      {open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    {typeof v.rating === "number" && (
                      <span className="inline-flex items-center gap-1 text-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {v.rating.toFixed(1)}
                      </span>
                    )}
                    {typeof dist === "number" && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {dist.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!coords && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Detecting your location...
          </div>
        )}
      </main>
    </div>
  );
}
