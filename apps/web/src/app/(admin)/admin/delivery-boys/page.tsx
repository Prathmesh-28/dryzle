"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DB {
  id: string;
  name?: string;
  phone?: string;
  vehicleType?: string;
  status?: string;
  kycApproved?: boolean;
  isAvailable?: boolean;
}

function statusOf(d: DB): string {
  if (d.status) return d.status;
  if (d.kycApproved === false) return "KYC PENDING";
  return d.isAvailable ? "ONLINE" : "OFFLINE";
}

export default function AdminDeliveryBoys() {
  const [list, setList] = useState<DB[] | null>(null);
  const load = () =>
    apiGet<DB[] | { deliveryBoys: DB[] }>("/admin/delivery-boys")
      .then((d) => setList(Array.isArray(d) ? d : d.deliveryBoys))
      .catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try {
      await apiPatch(`/admin/delivery-boys/${id}/approve`);
      toast.success("KYC approved");
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Delivery Boys</h1>
      </header>
      <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {!list ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    None yet
                  </td>
                </tr>
              ) : (
                list.map((d) => {
                  const s = statusOf(d);
                  const pending = s.includes("KYC");
                  return (
                    <tr key={d.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{d.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.phone || "—"}</td>
                      <td className="px-4 py-3">{d.vehicleType || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
                            pending && "bg-yellow-100 text-yellow-800",
                            s === "ONLINE" && "bg-green-100 text-green-800",
                            s === "OFFLINE" && "bg-muted text-muted-foreground",
                          )}
                        >
                          {s}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {pending ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approve(d.id)}
                          >
                            Approve KYC
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
