"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettings() {
  const [commissionPct, setCommissionPct] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet<{ platformCommission?: number }>("/admin/settings")
      .then((d) => {
        if (typeof d.platformCommission === "number") {
          setCommissionPct(String(Math.round(d.platformCommission * 10000) / 100));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const pct = Number(commissionPct);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Enter a value between 0 and 100");
      return;
    }
    setSaving(true);
    try {
      await apiPatch("/admin/settings", { platformCommission: pct / 100 });
      toast.success("Settings saved");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide configuration</p>
      </header>

      <div className="rounded-2xl bg-card border shadow-sm p-6 max-w-md">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium mb-2">
              Platform Commission (%)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={commissionPct}
              onChange={(e) => setCommissionPct(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Percentage of order amount retained by Dryzle
            </p>
            <Button onClick={save} disabled={saving} className="mt-5 w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
