"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Store, Bike, ShoppingBag,
  LineChart, Settings, ChevronRight, Sparkles, Shield,
  Eye, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem =
  | { divider: true; label: string; href?: undefined; icon?: undefined; role?: undefined; color?: undefined }
  | { divider?: false; label: string; href: string; icon: React.ComponentType<{ className?: string }>; role?: string; color?: string };

const NAV: NavItem[] = [
  { label: "Overview", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { label: "All Roles", href: "/superadmin/roles", icon: Eye },
  { divider: true, label: "Role Views" },
  { label: "Customer View", href: "/customer", icon: Users, role: "CUSTOMER", color: "text-violet-500" },
  { label: "Vendor View", href: "/vendor/dashboard", icon: Store, role: "VENDOR", color: "text-indigo-500" },
  { label: "Delivery View", href: "/delivery/orders", icon: Bike, role: "DELIVERY", color: "text-orange-500" },
  { label: "Admin View", href: "/admin/dashboard", icon: ShoppingBag, role: "ADMIN", color: "text-teal-500" },
  { divider: true, label: "Platform" },
  { label: "Analytics", href: "/admin/analytics", icon: LineChart },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full bg-gray-950 text-white">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 grid place-items-center shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-sm tracking-tight">Dryzle</p>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> SUPER ADMIN
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-0.5">
        {NAV.map((item, i) => {
          if (item.divider) {
            return (
              <p key={i} className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3 pt-4 pb-1">
                {item.label}
              </p>
            );
          }
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href!} onClick={() => setOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90",
              )}>
                <item.icon className={cn("w-4 h-4", item.color, !item.color && (active ? "text-white" : "text-white/50"))} />
                <span className="flex-1">{item.label}</span>
                {item.role && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">
                    {item.role}
                  </span>
                )}
                {active && <ChevronRight className="w-3 h-3 text-white/40" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 grid place-items-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">Super Admin</p>
            <p className="text-[10px] text-white/40">Full platform access</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-gray-100">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-10">{sidebar}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gray-950 text-white border-b border-white/10">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">Super Admin</span>
          <span className="ml-auto text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3" /> SUPERADMIN
          </span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
