"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardShell({
  brand,
  items,
  children,
}: {
  brand: string;
  items: SidebarItem[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r">
        <div className="px-6 py-5 border-b">
          <h1 className="text-lg font-extrabold tracking-tight text-primary">{brand}</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active =
              pathname === it.to ||
              (it.to !== "/" && pathname.startsWith(it.to));
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                href={it.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="w-4 h-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <h1 className="font-extrabold text-primary">{brand}</h1>
          <button onClick={logout} className="text-sm text-muted-foreground">
            Logout
          </button>
        </header>
        <div className="md:hidden flex overflow-x-auto border-b bg-card px-2">
          {items.map((it) => {
            const active =
              pathname === it.to ||
              (it.to !== "/" && pathname.startsWith(it.to));
            return (
              <Link
                key={it.to}
                href={it.to}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>
    </div>
  );
}
