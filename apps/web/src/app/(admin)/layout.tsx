"use client";

import { type ReactNode } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Users,
  Bike,
  LineChart,
  Settings,
} from "lucide-react";
import { RoleGuard } from "@/components/role-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow="ADMIN">
      <DashboardShell
        brand="Dryzle Admin"
        items={[
          { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Orders", to: "/admin/orders", icon: ClipboardList },
          { label: "Vendors", to: "/admin/vendors", icon: Store },
          { label: "Users", to: "/admin/users", icon: Users },
          { label: "Delivery Boys", to: "/admin/delivery-boys", icon: Bike },
          { label: "Analytics", to: "/admin/analytics", icon: LineChart },
          { label: "Settings", to: "/admin/settings", icon: Settings },
        ]}
      >
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
