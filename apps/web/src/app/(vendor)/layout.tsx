"use client";

import { type ReactNode } from "react";
import { LayoutDashboard, ClipboardList, Wrench } from "lucide-react";
import { RoleGuard } from "@/components/role-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow="VENDOR">
      <DashboardShell
        brand="Dryzle Vendor"
        items={[
          { label: "Dashboard", to: "/vendor/dashboard", icon: LayoutDashboard },
          { label: "Orders", to: "/vendor/orders", icon: ClipboardList },
          { label: "Services", to: "/vendor/services", icon: Wrench },
        ]}
      >
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
