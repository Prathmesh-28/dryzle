"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { inr } from "@/lib/format";

interface E {
  today?: number;
  week?: number;
  month?: number;
  totalDeliveries?: number;
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border shadow-sm p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
    </div>
  );
}

export default function Earnings() {
  const [e, setE] = useState<E | null>(null);
  useEffect(() => {
    apiGet<E>("/delivery/earnings").then(setE).catch(() => setE({}));
  }, []);

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-3">Your earnings</h2>
      <div className="grid grid-cols-2 gap-3">
        <Card label="Today" value={inr(e?.today ?? 0)} />
        <Card label="This Week" value={inr(e?.week ?? 0)} />
        <Card label="This Month" value={inr(e?.month ?? 0)} />
        <Card label="Total Deliveries" value={String(e?.totalDeliveries ?? 0)} />
      </div>
    </div>
  );
}
