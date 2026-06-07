"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bike, IndianRupee, LogOut } from "lucide-react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/role-guard";
import { clearAuth } from "@/lib/auth";
import { apiPatch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dryzle_online") === "1";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dryzle_online", online ? "1" : "0");
    }
  }, [online]);

  const toggleOnline = async (val: boolean) => {
    setOnline(val);
    try {
      await apiPatch("/delivery/availability", { isAvailable: val });
      toast.success(val ? "You're online" : "You're offline");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setOnline(!val);
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <RoleGuard allow="DELIVERY_BOY">
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-30 bg-card border-b px-4 py-3 flex items-center justify-between">
          <h1 className="font-extrabold text-primary">Dryzle Delivery</h1>
          <button
            onClick={() => toggleOnline(!online)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
              online
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                online ? "bg-green-500" : "bg-muted-foreground",
              )}
            />
            {online ? "Online" : "Offline"}
            <Switch checked={online} onCheckedChange={toggleOnline} />
          </button>
        </header>

        {children}

        <nav className="fixed bottom-0 inset-x-0 bg-card border-t z-40">
          <div className="max-w-md mx-auto grid grid-cols-3">
            <Link
              href="/delivery/orders"
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                pathname.startsWith("/delivery/orders")
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Bike className="w-5 h-5" />
              Orders
            </Link>
            <Link
              href="/delivery/earnings"
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                pathname.startsWith("/delivery/earnings")
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <IndianRupee className="w-5 h-5" />
              Earnings
            </Link>
            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </RoleGuard>
  );
}
