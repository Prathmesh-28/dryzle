"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, IndianRupee, Clock, Star,
  TrendingUp, TrendingDown, ArrowRight, Package, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { apiGet } from "@/lib/api";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Stats {
  todayOrders?: number;
  todayRevenue?: number;
  pendingOrders?: number;
  rating?: number;
  todayOrdersTrend?: number;
  todayRevenueTrend?: number;
}

interface RecentOrder {
  id: string;
  orderNumber?: string;
  customer?: { name?: string };
  amount?: number;
  totalAmount?: number;
  status: string;
  createdAt?: string;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  iconColor: string;
  trend?: number;
}

function StatCard({ label, value, icon: Icon, bg, iconColor, trend }: StatCardProps) {
  const up = trend !== undefined && trend >= 0;
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl grid place-items-center", bg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {trend !== undefined && (
          <span className={cn("text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full",
            up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          )}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);

  useEffect(() => {
    apiGet<Stats>("/vendors/me/stats").then(setStats).catch(() => setStats({}));
    apiGet<RecentOrder[] | { orders: RecentOrder[] }>("/orders?role=vendor&limit=5")
      .then((d) => setRecent(Array.isArray(d) ? d : (d?.orders ?? [])))
      .catch(() => setRecent([]));
  }, []);

  const pending = stats?.pendingOrders ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-0.5">
            Your Dashboard
          </h1>
        </div>
        {pending > 0 && (
          <Link href="/vendor/orders">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl text-sm font-semibold">
              <Package className="w-4 h-4" />
              {pending} pending
            </div>
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Today's Orders"
          value={String(stats?.todayOrders ?? 0)}
          icon={ShoppingBag}
          bg="bg-indigo-50"
          iconColor="text-indigo-500"
          trend={stats?.todayOrdersTrend}
        />
        <StatCard
          label="Today's Revenue"
          value={inr(stats?.todayRevenue ?? 0)}
          icon={IndianRupee}
          bg="bg-emerald-50"
          iconColor="text-emerald-500"
          trend={stats?.todayRevenueTrend}
        />
        <StatCard
          label="Pending Orders"
          value={String(stats?.pendingOrders ?? 0)}
          icon={Clock}
          bg="bg-amber-50"
          iconColor="text-amber-500"
        />
        <StatCard
          label="Your Rating"
          value={stats?.rating ? stats.rating.toFixed(1) + " ★" : "—"}
          icon={Star}
          bg="bg-yellow-50"
          iconColor="text-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/vendor/orders">
          <Button className="w-full h-12 rounded-xl justify-between" variant="outline">
            Manage Orders <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/vendor/services">
          <Button className="w-full h-12 rounded-xl justify-between" variant="outline">
            Edit Services <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Recent Orders */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Recent Orders</h2>
            <Link href="/vendor/orders">
              <span className="text-sm text-indigo-600 font-medium flex items-center gap-0.5">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm divide-y">
            {recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {o.customer?.name || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{(o.orderNumber || o.id.slice(-6)).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-bold text-gray-900">
                    {inr(o.amount ?? o.totalAmount ?? 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty recent */}
      {recent.length === 0 && stats !== null && (
        <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No orders yet today</p>
          <p className="text-xs text-muted-foreground mt-1">New orders will appear here</p>
        </div>
      )}
    </div>
  );
}
