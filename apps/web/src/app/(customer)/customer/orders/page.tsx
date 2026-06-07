"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Receipt } from "lucide-react";
import { apiGet } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { inr, fmtDateTime } from "@/lib/format";

interface Order {
  id: string;
  orderNumber?: string;
  number?: string;
  vendor?: { shopName?: string; name?: string };
  vendorName?: string;
  status: string;
  amount?: number;
  totalAmount?: number;
  createdAt?: string;
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    apiGet<Order[] | { orders: Order[] }>("/orders/my")
      .then((d) => setOrders(Array.isArray(d) ? d : d.orders))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <header className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white px-4 pt-6 pb-5 rounded-b-3xl">
        <h1 className="text-2xl font-extrabold">Your Orders</h1>
        <p className="text-sm text-white/80 mt-1">Track and revisit past orders</p>
      </header>

      <main className="px-4 pt-5 space-y-3">
        {!orders ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 grid place-items-center mb-4">
              <Receipt className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold">No orders yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Place your first order from a nearby laundry
            </p>
          </div>
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              href={`/customer/orders/${o.id}`}
              className="block rounded-2xl bg-card p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    #{o.orderNumber || o.number || o.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="font-semibold truncate mt-0.5">
                    {o.vendor?.shopName || o.vendor?.name || o.vendorName || "Laundry"}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-muted-foreground">{fmtDateTime(o.createdAt)}</span>
                <span className="font-semibold">{inr(o.amount ?? o.totalAmount)}</span>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
