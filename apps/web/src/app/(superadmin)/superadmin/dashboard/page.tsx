"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  Users, Store, Bike, ShoppingBag, IndianRupee,
  TrendingUp, ArrowUpRight, Shield, Activity,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PlatformStats {
  totalUsers?: number;
  totalVendors?: number;
  totalDeliveryBoys?: number;
  totalOrders?: number;
  gmvToday?: number;
  gmvWeek?: number;
  gmvMonth?: number;
  gmvTotal?: number;
  ordersToday?: number;
  activeVendors?: number;
  activeDeliveryBoys?: number;
  newUsersToday?: number;
  pendingVendorApprovals?: number;
  pendingKyc?: number;
  weeklyRevenue?: Array<{ day: string; revenue: number }>;
  dailyOrders?: Array<{ date: string; orders: number }>;
}

const ROLES = [
  {
    label: "Customer",
    href: "/customer",
    icon: Users,
    color: "bg-violet-500",
    light: "bg-violet-50 text-violet-600",
    desc: "Browse vendors, place & track orders",
  },
  {
    label: "Vendor",
    href: "/vendor/dashboard",
    icon: Store,
    color: "bg-indigo-500",
    light: "bg-indigo-50 text-indigo-600",
    desc: "Manage orders and services",
  },
  {
    label: "Delivery Boy",
    href: "/delivery/orders",
    icon: Bike,
    color: "bg-orange-500",
    light: "bg-orange-50 text-orange-600",
    desc: "Accept and deliver orders",
  },
  {
    label: "Admin",
    href: "/admin/dashboard",
    icon: ShoppingBag,
    color: "bg-teal-500",
    light: "bg-teal-50 text-teal-600",
    desc: "Platform operations and approvals",
  },
];

function KpiCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>;
  accent: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={cn("w-10 h-10 rounded-xl grid place-items-center mb-3", accent)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [s, setS] = useState<PlatformStats | null>(null);

  useEffect(() => {
    apiGet<PlatformStats>("/admin/dashboard").then(setS).catch(() => setS({}));
  }, []);

  const weekly = s?.weeklyRevenue ?? Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], revenue: 0,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Super Admin</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          Live
        </div>
      </div>

      {/* GMV Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard label="GMV Today" value={inr(s?.gmvToday ?? 0)} icon={IndianRupee} accent="bg-emerald-500" />
        <KpiCard label="GMV This Week" value={inr(s?.gmvWeek ?? 0)} icon={TrendingUp} accent="bg-indigo-500" />
        <KpiCard label="GMV This Month" value={inr(s?.gmvMonth ?? 0)} icon={IndianRupee} accent="bg-violet-500" />
        <KpiCard label="Orders Today" value={String(s?.ordersToday ?? 0)} icon={ShoppingBag} accent="bg-orange-500" />
      </div>

      {/* User counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Users" value={String(s?.totalUsers ?? "—")} icon={Users} accent="bg-sky-500" />
        <KpiCard label="Total Vendors" value={String(s?.totalVendors ?? "—")} icon={Store} accent="bg-teal-500" />
        <KpiCard label="Delivery Boys" value={String(s?.totalDeliveryBoys ?? "—")} icon={Bike} accent="bg-amber-500" />
        <KpiCard label="Total Orders" value={String(s?.totalOrders ?? "—")} icon={ShoppingBag} accent="bg-rose-500" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-sm text-gray-900 mb-1">Weekly Revenue</h2>
          <p className="text-xs text-muted-foreground mb-5">GMV last 7 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekly} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
              <Tooltip formatter={(v: number) => [inr(v), "Revenue"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-sm text-gray-900 mb-1">Daily Orders</h2>
          <p className="text-xs text-muted-foreground mb-5">Order volume trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={s?.dailyOrders ?? weekly.map(w => ({ date: w.day, orders: 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Line dataKey="orders" stroke="#6366f1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role Cards */}
      <h2 className="font-bold text-base text-gray-900 mb-4">View as Role</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((r) => (
          <Link key={r.label} href={r.href}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition group cursor-pointer">
              <div className={cn("w-11 h-11 rounded-xl grid place-items-center mb-4", r.color)}>
                <r.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">{r.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                Open view <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
