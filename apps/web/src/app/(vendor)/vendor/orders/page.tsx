"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { inr } from "@/lib/format";

interface Order {
  id: string;
  orderNumber?: string;
  customer?: { name?: string; phone?: string };
  customerName?: string;
  items?: Array<{ quantity?: number; service?: { name?: string }; name?: string }>;
  amount?: number;
  totalAmount?: number;
  status: string;
}

const NEXT: Record<string, string> = {
  PLACED: "ACCEPTED",
  ACCEPTED: "PICKED_UP",
  PICKED_UP: "IN_PROGRESS",
  IN_PROGRESS: "READY",
};
const ACTION_LABEL: Record<string, string> = {
  PLACED: "Accept",
  ACCEPTED: "Mark Picked Up",
  PICKED_UP: "Start Processing",
  IN_PROGRESS: "Mark Ready",
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    apiGet<Order[] | { orders: Order[] }>("/orders", { role: "vendor" })
      .then((d) => setOrders(Array.isArray(d) ? d : d.orders))
      .catch(() => setOrders([]));
  }, []);

  const advance = async (o: Order) => {
    const next = NEXT[o.status];
    if (!next) return;
    const prev = o.status;
    setOrders((list) =>
      list ? list.map((x) => (x.id === o.id ? { ...x, status: next } : x)) : list,
    );
    try {
      await apiPatch(`/orders/${o.id}/status`, { status: next });
      toast.success(`Order moved to ${next.replace(/_/g, " ")}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setOrders((list) =>
        list ? list.map((x) => (x.id === o.id ? { ...x, status: prev } : x)) : list,
      );
      toast.error(err?.response?.data?.message || "Could not update");
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage incoming orders</p>
      </header>

      <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Order #</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {!orders ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const summary =
                    o.items
                      ?.map((it) => `${it.service?.name || it.name} ×${it.quantity}`)
                      .join(", ") || "—";
                  return (
                    <tr key={o.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        #{o.orderNumber || o.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        {o.customer?.name || o.customerName || "—"}
                      </td>
                      <td className="px-4 py-3 max-w-[260px] truncate text-muted-foreground">
                        {summary}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {inr(o.amount ?? o.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {NEXT[o.status] ? (
                          <Button size="sm" onClick={() => advance(o)}>
                            {ACTION_LABEL[o.status]}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
