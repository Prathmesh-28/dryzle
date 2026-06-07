"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Vendor {
  id: string;
  shopName?: string;
  name?: string;
  phone?: string;
  rating?: number;
  status?: "PENDING" | "APPROVED" | "SUSPENDED" | string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  SUSPENDED: "bg-red-100 text-red-800",
};

export default function AdminVendors() {
  const [list, setList] = useState<Vendor[] | null>(null);

  const load = () =>
    apiGet<Vendor[] | { vendors: Vendor[] }>("/admin/vendors")
      .then((d) => setList(Array.isArray(d) ? d : d.vendors))
      .catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try {
      await apiPatch(`/admin/vendors/${id}/approve`);
      toast.success("Vendor approved");
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed");
    }
  };
  const suspend = async (id: string) => {
    try {
      await apiPatch(`/admin/vendors/${id}/suspend`);
      toast.success("Vendor status updated");
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Vendors</h1>
      </header>
      <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Shop Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
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
                    No vendors
                  </td>
                </tr>
              ) : (
                list.map((v) => {
                  const status = (v.status || "PENDING").toUpperCase();
                  return (
                    <tr key={v.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{v.shopName || v.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.phone || "—"}</td>
                      <td className="px-4 py-3">
                        {typeof v.rating === "number" ? `${v.rating.toFixed(1)} ★` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
                            STATUS_COLOR[status] || "bg-muted text-muted-foreground",
                          )}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {status === "PENDING" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approve(v.id)}
                          >
                            Approve
                          </Button>
                        )}
                        {status === "APPROVED" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => suspend(v.id)}
                          >
                            Suspend
                          </Button>
                        )}
                        {status === "SUSPENDED" && (
                          <Button size="sm" onClick={() => suspend(v.id)}>
                            Unsuspend
                          </Button>
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
