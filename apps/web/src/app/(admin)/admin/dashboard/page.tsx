"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Store, Bike, ShoppingBag,
  IndianRupee, ArrowUpRight, AlertCircle,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Dash {
  gmvToday?: number;
  gmvWeek?: number;
  gmvMonth?: number;
  ordersToday?: number;
  activeVendors?: number;
  activeDeliveryBoys?: number;
  newUsersToday?: number;
  weeklyRevenue?: Array<{ day: string; revenue: number }>;
  pendingVendorApprovals?: number;
  pendingKyc?: number;
}

interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  iconBg: string;
  trend?: number;
  large?: boolean;
}

function Kpi({ label, value, sub, icon: Icon, accent, iconBg, trend, large }: KpiProps) {
  const up = trend !== undefined && trend >= 0;
  return (
    <div className={cn("rounded-2xl bg-white border border-gray-100 shadow-sm p-5 relative overflow-hidden", large && "sm:col-span-2")}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl grid place-items-center", iconBg)}>
          <Icon className={cn("w-5 h-5", accent)} />
        </div>
        {trend !== undefined && (
          <span className={cn("text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full",
            up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          )}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className={cn("font-extrabold tracking-tight mt-3 text-gray-900", large ? "text-4xl" : "text-2xl")}>{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function AlertCard({ label, count, href }: { label: string; count: number; href: string }) {
  if (!count) return null;
  return (
    <a href={href} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition">
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
      <span className="text-sm font-semibold text-amber-800 flex-1">{label}</span>
      <span className="text-sm font-bold text-amber-700 flex items-center gap-0.5">
        {count} <ArrowUpRight className="w-3.5 h-3.5" />
      </span>
    </a>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-bold text-indigo-600">{inr(payload[0].value)}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [d, setD] = useState<Dash | null>(null);

  useEffect(() => {
    apiGet<Dash>("/admin/dashboard").then(setD).catch(() => setD({}));
  }, []);

  const weeklyRevenue = d?.weeklyRevenue ?? [
    { day: "Mon", revenue: 0 }, { day: "Tue", revenue: 0 }, { day: "Wed", revenue: 0 },
    { day: "Thu", revenue: 0 }, { day: "Fri", revenue: 0 }, { day: "Sat", revenue: 0 }, { day: "Sun", revenue: 0 },
  ];

  const pendingApprovals = d?.pendingVendorApprovals ?? 0;
  const pendingKyc = d?.pendingKyc ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Alerts */}
      {(pendingApprovals > 0 || pendingKyc > 0) && (
        <div className="space-y-2 mb-6">
          <AlertCard label="Vendor approvals pending" count={pendingApprovals} href="/admin/vendors" />
          <AlertCard label="Delivery boy KYC pending" count={pendingKyc} href="/admin/delivery-boys" />
        </div>
      )}

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <Kpi label="GMV Today" value={inr(d?.gmvToday ?? 0)} icon={IndianRupee} accent="text-indigo-500" iconBg="bg-indigo-50" />
        <Kpi label="Orders Today" value={String(d?.ordersToday ?? 0)} icon={ShoppingBag} accent="text-violet-500" iconBg="bg-violet-50" />
        <Kpi label="New Users" value={String(d?.newUsersToday ?? 0)} icon={Users} accent="text-sky-500" iconBg="bg-sky-50" />
        <Kpi label="GMV This Week" value={inr(d?.gmvWeek ?? 0)} icon={TrendingUp} accent="text-emerald-500" iconBg="bg-emerald-50" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <Kpi label="Active Vendors" value={String(d?.activeVendors ?? 0)} icon={Store} accent="text-teal-500" iconBg="bg-teal-50" />
        <Kpi label="Active Delivery Boys" value={String(d?.activeDeliveryBoys ?? 0)} icon={Bike} accent="text-orange-500" iconBg="bg-orange-50" />
        <Kpi label="GMV This Month" value={inr(d?.gmvMonth ?? 0)} icon={IndianRupee} accent="text-rose-500" iconBg="bg-rose-50" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-base text-gray-900">Weekly Revenue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days GMV</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-gray-900">{inr(d?.gmvWeek ?? 0)}</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyRevenue} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
            />
            <Tooltip content={<CUSTOM_TOOLTIP />} cursor={{ fill: "#f1f5f9", radius: 8 }} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
