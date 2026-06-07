"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { apiGet } from "@/lib/api";

interface A {
  retention?: Array<{ label: string; rate: number }>;
  serviceBreakdown?: Array<{ name: string; value: number }>;
}

const COLORS = ["#4F46E5", "#0EA5E9", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6"];

export default function AdminAnalytics() {
  const [a, setA] = useState<A | null>(null);
  useEffect(() => {
    apiGet<A>("/admin/analytics").then(setA).catch(() => setA({}));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border shadow-sm p-5">
          <h2 className="font-semibold mb-4">User Retention</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={a?.retention ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(0 0% 0% / 0.08)" }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#4F46E5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Service Breakdown</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={a?.serviceBreakdown ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {(a?.serviceBreakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(0 0% 0% / 0.08)" }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
