"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Bike, MapPin, Phone, ChevronRight,
  WashingMachine, IndianRupee, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/status-badge";
import { apiGet, apiPatch } from "@/lib/api";
import { inr } from "@/lib/format";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber?: string;
  vendor?: { shopName?: string; name?: string; address?: string };
  customer?: { name?: string; phone?: string; address?: string };
  amount?: number;
  totalAmount?: number;
  status: string;
}

interface Earnings {
  today?: number;
  week?: number;
  todayDeliveries?: number;
}

const NEXT: Record<string, string> = {
  READY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const ACTION_LABEL: Record<string, string> = {
  READY: "Start Delivery",
  OUT_FOR_DELIVERY: "Mark Delivered",
};

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [available, setAvailable] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const watchers = useRef<Record<string, number>>({});

  const load = () => {
    apiGet<Order[] | { orders: Order[] }>("/delivery/my-orders")
      .then((d) => setOrders(Array.isArray(d) ? d : d.orders))
      .catch(() => setOrders([]));
    apiGet<{ isAvailable?: boolean }>("/delivery/me")
      .then((d) => setAvailable(d?.isAvailable ?? false))
      .catch(() => null);
    apiGet<Earnings>("/delivery/earnings")
      .then(setEarnings)
      .catch(() => null);
  };

  useEffect(() => {
    load();
    return () => {
      Object.values(watchers.current).forEach((id) =>
        navigator.geolocation?.clearWatch(id),
      );
    };
  }, []);

  const toggleAvail = async () => {
    setTogglingAvail(true);
    try {
      await apiPatch("/delivery/availability", { isAvailable: !available });
      setAvailable((v) => !v);
      toast.success(!available ? "You are now online" : "You are now offline");
    } catch {
      toast.error("Could not update status");
    } finally {
      setTogglingAvail(false);
    }
  };

  const startTracking = (orderId: string) => {
    if (!navigator.geolocation || watchers.current[orderId]) return;
    const socket = getSocket();
    const id = navigator.geolocation.watchPosition(
      (pos) => socket.emit("location:update", { orderId, lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    watchers.current[orderId] = id;
  };

  const stopTracking = (orderId: string) => {
    const id = watchers.current[orderId];
    if (id != null) { navigator.geolocation?.clearWatch(id); delete watchers.current[orderId]; }
  };

  const advance = async (order: Order) => {
    const next = NEXT[order.status];
    if (!next) return;
    try {
      await apiPatch(`/orders/${order.id}/status`, { status: next });
      if (next === "OUT_FOR_DELIVERY") startTracking(order.id);
      if (next === "DELIVERED") stopTracking(order.id);
      setOrders((prev) =>
        prev?.map((o) => (o.id === order.id ? { ...o, status: next } : o)) ?? null,
      );
      toast.success(next === "DELIVERED" ? "Order delivered! 🎉" : "On the way!");
    } catch {
      toast.error("Could not update order");
    }
  };

  const active = orders?.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED") ?? [];
  const done = orders?.filter((o) => o.status === "DELIVERED") ?? [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className={cn(
        "px-4 pt-12 pb-6 transition-colors",
        available
          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          : "bg-gradient-to-br from-gray-600 to-gray-700 text-white",
      )}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white/70 text-xs font-medium">Delivery Partner</p>
              <h1 className="text-xl font-extrabold tracking-tight">My Orders</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {available ? "Online" : "Offline"}
              </span>
              <Switch
                checked={available}
                onCheckedChange={toggleAvail}
                disabled={togglingAvail}
                className="data-[state=checked]:bg-white/30"
              />
            </div>
          </div>

          {/* Earnings strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Today", value: inr(earnings?.today ?? 0), icon: IndianRupee },
              { label: "This Week", value: inr(earnings?.week ?? 0), icon: IndianRupee },
              { label: "Deliveries", value: String(earnings?.todayDeliveries ?? done.length), icon: Package },
            ].map((s) => (
              <div key={s.label} className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-white/70 text-xs">{s.label}</p>
                <p className="font-extrabold text-sm mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 pb-24">

        {/* No orders */}
        {orders === null ? (
          <div className="space-y-3 mt-2">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-32" />
            ))}
          </div>
        ) : active.length === 0 && done.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 grid place-items-center mb-4">
              <Bike className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="font-semibold text-sm">No orders assigned</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {available ? "Waiting for new orders…" : "Go online to receive orders"}
            </p>
          </div>
        ) : (
          <>
            {/* Active Orders */}
            {active.length > 0 && (
              <>
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">Active</h2>
                <div className="space-y-3 mb-6">
                  {active.map((o) => {
                    const actionLabel = ACTION_LABEL[o.status];
                    return (
                      <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                #{(o.orderNumber || o.id.slice(-6)).toUpperCase()}
                              </p>
                              <p className="font-semibold text-sm">{o.vendor?.shopName || o.vendor?.name || "Laundry"}</p>
                            </div>
                            <StatusBadge status={o.status} />
                          </div>

                          <div className="space-y-1.5 mb-3">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <WashingMachine className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Pickup: {o.vendor?.address || "—"}</span>
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Drop: {o.customer?.address || "Customer address"}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base">{inr(o.amount ?? o.totalAmount ?? 0)}</span>
                            {o.customer?.phone && (
                              <a href={`tel:${o.customer.phone}`} className="w-8 h-8 rounded-full bg-emerald-50 grid place-items-center">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              </a>
                            )}
                          </div>
                        </div>

                        {actionLabel && (
                          <div className="px-4 pb-4">
                            <Button
                              className={cn("w-full rounded-xl h-11",
                                o.status === "READY"
                                  ? "bg-indigo-600 hover:bg-indigo-700"
                                  : "bg-emerald-600 hover:bg-emerald-700",
                              )}
                              onClick={() => advance(o)}
                            >
                              {actionLabel}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Completed today */}
            {done.length > 0 && (
              <>
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">Completed Today</h2>
                <div className="space-y-2">
                  {done.map((o) => (
                    <div key={o.id} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{o.vendor?.shopName || o.vendor?.name || "Laundry"}</p>
                        <p className="text-xs text-muted-foreground">#{(o.orderNumber || o.id.slice(-6)).toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} />
                        <span className="font-bold text-sm">{inr(o.amount ?? o.totalAmount ?? 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
