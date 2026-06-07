"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { inr, fmtDateTime, ORDER_FLOW } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";

interface OrderDetail {
  id: string;
  orderNumber?: string;
  status: string;
  amount?: number;
  totalAmount?: number;
  createdAt?: string;
  vendor?: { shopName?: string; name?: string };
  deliveryBoy?: { name?: string; phone?: string };
  items?: Array<{ id?: string; name?: string; quantity?: number; price?: number; service?: { name?: string } }>;
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    apiGet<OrderDetail>(`/orders/${id}`).then(setOrder).catch(() => {});
    const s = getSocket();
    s.emit("join", `order:${id}`);
    const onStatus = (payload: { orderId?: string; status: string }) => {
      if (!payload.orderId || payload.orderId === id) {
        setOrder((o) => (o ? { ...o, status: payload.status } : o));
      }
    };
    s.on("order:status", onStatus);
    return () => {
      s.off("order:status", onStatus);
      s.emit("leave", `order:${id}`);
    };
  }, [id]);

  const cancel = async () => {
    setCancelling(true);
    try {
      await apiPatch(`/orders/${id}/status`, { status: "CANCELLED" });
      setOrder((o) => (o ? { ...o, status: "CANCELLED" } : o));
      toast.success("Order cancelled");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Could not cancel");
    } finally {
      setCancelling(false);
    }
  };

  const currentIdx = order ? ORDER_FLOW.indexOf(order.status as typeof ORDER_FLOW[number]) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <div className="max-w-md mx-auto">
      <header className="sticky top-0 z-30 bg-card border-b px-4 py-3 flex items-center gap-3">
        <Link
          href="/customer/orders"
          className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold truncate">
            #{order?.orderNumber || (id ? id.slice(-6).toUpperCase() : "")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {order?.vendor?.shopName || order?.vendor?.name || "—"}
          </p>
        </div>
        {order && <StatusBadge status={order.status} />}
      </header>

      {!order ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <main className="p-4 space-y-4">
          {order.deliveryBoy?.name && (
            <div className="rounded-2xl bg-card p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Your delivery partner</p>
                <p className="font-semibold">{order.deliveryBoy.name}</p>
              </div>
              {order.deliveryBoy.phone && (
                <a href={`tel:${order.deliveryBoy.phone}`}>
                  <Button className="bg-green-600 hover:bg-green-700 gap-2">
                    <Phone className="w-4 h-4" /> Call
                  </Button>
                </a>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-card p-5 shadow-sm">
            <h2 className="font-semibold mb-4">Order progress</h2>
            {isCancelled ? (
              <p className="text-sm text-destructive font-medium">
                This order was cancelled.
              </p>
            ) : (
              <ol className="relative">
                {ORDER_FLOW.map((step, idx) => {
                  const done = idx < currentIdx;
                  const active = idx === currentIdx;
                  return (
                    <li key={step} className="flex gap-3 pb-5 last:pb-0 relative">
                      {idx < ORDER_FLOW.length - 1 && (
                        <span
                          className={cn(
                            "absolute left-[11px] top-6 bottom-0 w-0.5",
                            done ? "bg-primary" : "bg-muted",
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0",
                          active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                          done && "bg-primary text-primary-foreground",
                          !active && !done && "bg-muted text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="w-3 h-3" /> : idx + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm pt-0.5",
                          active && "font-semibold text-foreground",
                          done && "text-muted-foreground line-through",
                          !active && !done && "text-muted-foreground/70",
                        )}
                      >
                        {step.replace(/_/g, " ")}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {order.items && order.items.length > 0 && (
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <h2 className="font-semibold mb-3">Items</h2>
              <ul className="space-y-2 text-sm">
                {order.items.map((it, i) => (
                  <li key={it.id || i} className="flex justify-between">
                    <span>
                      {it.service?.name || it.name}{" "}
                      <span className="text-muted-foreground">× {it.quantity}</span>
                    </span>
                    <span>{inr((it.price || 0) * (it.quantity || 0))}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{inr(order.amount ?? order.totalAmount)}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Placed {fmtDateTime(order.createdAt)}
          </p>

          {order.status === "PLACED" && (
            <Button
              variant="outline"
              onClick={cancel}
              disabled={cancelling}
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Order"}
            </Button>
          )}
        </main>
      )}
    </div>
  );
}
