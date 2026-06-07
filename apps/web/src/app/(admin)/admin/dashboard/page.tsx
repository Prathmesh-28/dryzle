"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiGet } from "@/lib/api";
import { inr } from "@/lib/format";

interface Dash {
  gmvToday?: number;
  gmvWeek?: number;
  gmvMonth?: number;
  ordersToday?: number;
  activeVendors?: number;
  activeDeliveryBoys?: number;
  newUsersToday?: number;
  weeklyRevenue?: Array<{ day: string; revenue: number }>;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border shadow-sm p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [d, setD] = useState<Dash | null>(null);
  useEffect(() => {
    apiGet<Dash>("/admin/dashboard").then(setD).catch(() => setD({}));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="GMV Today" value={inr(d?.gmvToday ?? 0)} />
        <Kpi label="GMV Week" value={inr(d?.gmvWeek ?? 0)} />
        <Kpi label="Orders Today" value={String(d?.ordersToday ?? 0)} />
        <Kpi label="New Users" value={String(d?.newUsersToday ?? 0)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <Kpi label="Active Vendors" value={String(d?.activeVendors ?? 0)} />
        <Kpi label="Active Delivery Boys" value={String(d?.activeDeliveryBoys ?? 0)} />
        <Kpi label="GMV Month" value={inr(d?.gmvMonth ?? 0)} />
      </div>

      <div className="rounded-2xl bg-card border shadow-sm p-5 mt-6">
        <h2 className="font-semibold mb-4">Weekly Revenue</h2>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={d?.weeklyRevenue ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: number) => inr(v)}
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(0 0% 0% / 0.08)" }}
              />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
