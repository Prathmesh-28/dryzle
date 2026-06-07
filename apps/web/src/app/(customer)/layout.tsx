"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Receipt, LogOut } from "lucide-react";
import { RoleGuard } from "@/components/role-guard";
import { clearAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  const isActive = (path: string) =>
    path === "/customer" ? pathname === "/customer" : pathname.startsWith(path);

  return (
    <RoleGuard allow="CUSTOMER">
      <div className="min-h-screen bg-background pb-20">
        {children}
        <nav className="fixed bottom-0 inset-x-0 bg-card border-t z-40">
          <div className="max-w-md mx-auto grid grid-cols-3">
            <Link
              href="/customer"
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                isActive("/customer") && !pathname.startsWith("/customer/orders")
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link
              href="/customer/orders"
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                isActive("/customer/orders") ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Receipt className="w-5 h-5" />
              Orders
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
