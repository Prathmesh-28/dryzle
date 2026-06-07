"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";

interface Service {
  id: string;
  name: string;
  price: number;
  unit: "KG" | "PIECE" | "PAIR" | string;
}

export default function VendorMenu() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [services, setServices] = useState<Service[] | null>(null);
  const [vendorName, setVendorName] = useState<string>("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    apiGet<{ name?: string; shopName?: string; services?: Service[] } | Service[]>(
      `/vendors/${id}/services`,
    )
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data);
        } else {
          setServices(data.services || []);
          setVendorName(data.shopName || data.name || "");
        }
      })
      .catch(() => setServices([]));
    apiGet<{ shopName?: string; name?: string }>(`/vendors/${id}`)
      .then((v) => setVendorName(v.shopName || v.name || ""))
      .catch(() => {});
  }, [id]);

  const total = useMemo(() => {
    if (!services) return 0;
    return services.reduce((sum, s) => sum + (cart[s.id] || 0) * s.price, 0);
  }, [services, cart]);

  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);

  const updateQty = (sid: string, delta: number) => {
    setCart((c) => {
      const next = Math.max(0, (c[sid] || 0) + delta);
      const out = { ...c, [sid]: next };
      if (next === 0) delete out[sid];
      return out;
    });
  };

  const placeOrder = async () => {
    if (!services) return;
    setPlacing(true);
    try {
      const items = Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([serviceId, quantity]) => ({ serviceId, quantity }));
      const res = await apiPost<{ id: string; order?: { id: string } }>("/orders", {
        vendorId: id,
        items,
      });
      const newId = res.id || res.order?.id;
      toast.success("Order placed");
      if (newId) router.push(`/customer/orders/${newId}`);
      else router.push("/customer/orders");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <header className="sticky top-0 z-30 bg-card border-b px-4 py-3 flex items-center gap-3">
        <Link
          href="/customer"
          className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-semibold truncate">{vendorName || "Menu"}</h1>
          <p className="text-xs text-muted-foreground">Choose services</p>
        </div>
      </header>

      <main className="p-4 space-y-2">
        {!services ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No services available
          </p>
        ) : (
          services.map((s) => {
            const qty = cart[s.id] || 0;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.name}</p>
                  <p className="text-sm text-primary font-semibold mt-0.5">
                    {inr(s.price)}
                    <span className="text-muted-foreground font-normal">
                      {" "}/ {s.unit?.toLowerCase()}
                    </span>
                  </p>
                </div>
                {qty === 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQty(s.id, 1)}
                    className="border-primary text-primary font-semibold"
                  >
                    Add
                  </Button>
                ) : (
                  <div className="inline-flex items-center rounded-full border border-primary bg-primary/5">
                    <button
                      onClick={() => updateQty(s.id, -1)}
                      className="w-8 h-8 grid place-items-center text-primary"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                    <button
                      onClick={() => updateQty(s.id, 1)}
                      className="w-8 h-8 grid place-items-center text-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {totalQty > 0 && (
        <div className="fixed bottom-16 inset-x-0 px-4 z-30">
          <div className="max-w-md mx-auto">
            <Button
              onClick={placeOrder}
              disabled={placing}
              className="w-full h-14 text-base font-semibold shadow-xl"
            >
              {placing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Place Order · {inr(total)}</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
