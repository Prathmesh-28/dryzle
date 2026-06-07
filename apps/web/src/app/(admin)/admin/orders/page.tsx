"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { inr, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  orderNumber?: string;
  customer?: { name?: string };
  vendor?: { shopName?: string; name?: string };
  amount?: number;
  totalAmount?: number;
  status: string;
  createdAt?: string;
}

const FILTERS = [
  "ALL",
  "PLACED",
  "ACCEPTED",
  "PICKED_UP",
  "IN_PROGRESS",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const PAGE_SIZE = 20;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiGet<Order[] | { orders: Order[] }>("/admin/orders")
      .then((d) => setOrders(Array.isArray(d) ? d : d.orders))
      .catch(() => setOrders([]));
  }, []);

  const filtered = useMemo(
    () => (orders ? orders.filter((o) => filter === "ALL" || o.status === filter) : []),
    [orders, filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Order #</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {!orders ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    No orders
                  </td>
                </tr>
              ) : (
                pageData.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3 font-medium">
                      #{o.orderNumber || o.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">{o.customer?.name || "—"}</td>
                    <td className="px-4 py-3">
                      {o.vendor?.shopName || o.vendor?.name || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {inr(o.amount ?? o.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtDateTime(o.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {orders && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <span className="text-muted-foreground">
              Page {page} of {totalPages} · {filtered.length} orders
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
