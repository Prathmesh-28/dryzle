"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, IndianRupee, Clock, Star } from "lucide-react";
import { apiGet } from "@/lib/api";
import { inr } from "@/lib/format";

interface Stats {
  todayOrders?: number;
  todayRevenue?: number;
  pendingOrders?: number;
  rating?: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm border">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <div className={`w-9 h-9 rounded-xl grid place-items-center ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-extrabold mt-3">{value}</p>
    </div>
  );
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiGet<Stats>("/vendors/me/stats").then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back — here&apos;s how today is going
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        <StatCard
          label="Today's Orders"
          value={String(stats?.todayOrders ?? 0)}
          icon={ShoppingBag}
          accent="bg-indigo-100 text-indigo-700"
        />
        <StatCard
          label="Today's Revenue"
          value={inr(stats?.todayRevenue ?? 0)}
          icon={IndianRupee}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Pending Orders"
          value={String(stats?.pendingOrders ?? 0)}
          icon={Clock}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Rating"
          value={stats?.rating ? `${stats.rating.toFixed(1)} ★` : "—"}
          icon={Star}
          accent="bg-yellow-100 text-yellow-700"
        />
      </div>
    </div>
  );
}
