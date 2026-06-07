"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Bike, MapPin } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { inr } from "@/lib/format";
import { getSocket } from "@/lib/socket";

interface Order {
  id: string;
  orderNumber?: string;
  vendor?: { shopName?: string; name?: string; address?: string };
  customer?: { name?: string; phone?: string; address?: string };
  amount?: number;
  totalAmount?: number;
  status: string;
}

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const watchers = useRef<Record<string, number>>({});

  const load = () => {
    apiGet<Order[] | { orders: Order[] }>("/delivery/my-orders")
      .then((d) => setOrders(Array.isArray(d) ? d : d.orders))
      .catch(() => setOrders([]));
  };
  useEffect(load, []);

  const startTracking = (orderId: string) => {
    if (!navigator.geolocation || watchers.current[orderId]) return;
    const socket = getSocket();
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("location:update", {
          orderId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    watchers.current[orderId] = id;
  };

  const stopTracking = (orderId: string) => {
    const id = watchers.current[orderId];
    if (id != null) {
      navigator.geolocation?.clearWatch(id);
      delete watchers.current[orderId];
    }
  };

  useEffect(() => {
    return () => {
      Object.values(watchers.current).forEach((id) =>
        navigator.geolocation?.clearWatch(id),
      );
    };
  }, []);

  const startDelivery = async (o: Order) => {
    const prev = o.status;
    setOrders((l) =>
      l ? l.map((x) => (x.id === o.id ? { ...x, status: "OUT_FOR_DELIVERY" } : x)) : l,
    );
    try {
      await apiPatch(`/orders/${o.id}/status`, { status: "OUT_FOR_DELIVERY" });
      startTracking(o.id);
      toast.success("Delivery started — sharing location");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setOrders((l) =>
        l ? l.map((x) => (x.id === o.id ? { ...x, status: prev } : x)) : l,
      );
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const markDelivered = async (o: Order) => {
    const prev = o.status;
    setOrders((l) =>
      l ? l.map((x) => (x.id === o.id ? { ...x, status: "DELIVERED" } : x)) : l,
    );
    try {
      await apiPatch(`/orders/${o.id}/status`, { status: "DELIVERED" });
      stopTracking(o.id);
      toast.success("Marked delivered");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setOrders((l) =>
        l ? l.map((x) => (x.id === o.id ? { ...x, status: prev } : x)) : l,
      );
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Assigned orders</h2>

      {!orders ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 grid place-items-center mb-4">
            <Bike className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-semibold">No deliveries</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Go online to start receiving orders
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-card p-4 shadow-sm border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    #{o.orderNumber || o.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="font-semibold truncate mt-0.5">
                    {o.vendor?.shopName || o.vendor?.name || "Vendor"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    → {o.customer?.name || "Customer"}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              {(o.vendor?.address || o.customer?.address) && (
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  {o.vendor?.address && (
                    <p className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Pickup: {o.vendor.address}</span>
                    </p>
                  )}
                  {o.customer?.address && (
                    <p className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>Drop: {o.customer.address}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <span className="font-semibold">{inr(o.amount ?? o.totalAmount)}</span>
                {o.status === "READY" && (
                  <Button size="sm" onClick={() => startDelivery(o)}>
                    Start Delivery
                  </Button>
                )}
                {o.status === "OUT_FOR_DELIVERY" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => markDelivered(o)}
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
