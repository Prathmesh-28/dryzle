"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Store, Bike, ShoppingBag, Shield,
  ArrowUpRight, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RoleStats {
  customers?: { total: number; newToday: number };
  vendors?: { total: number; active: number; pending: number; suspended: number };
  deliveryBoys?: { total: number; online: number; pendingKyc: number };
  orders?: { total: number; today: number; placed: number; inProgress: number; delivered: number };
}


function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3 rounded-xl", color)}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-extrabold text-lg">{value}</span>
    </div>
  );
}

export default function RolesPage() {
  const [stats, setStats] = useState<RoleStats | null>(null);

  useEffect(() => {
    apiGet<RoleStats>("/admin/role-stats").then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-5 h-5 text-emerald-500" />
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Super Admin</span>
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-8">All Roles</h1>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Customers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500 grid place-items-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Customers</h2>
                <p className="text-xs text-muted-foreground">Buyers using the platform</p>
              </div>
            </div>
            <Link href="/customer">
              <div className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:gap-1 transition-all">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
          <div className="p-5 space-y-2">
            <Pill label="Total customers" value={stats?.customers?.total ?? 0} color="bg-violet-50 text-violet-700" />
            <Pill label="New today" value={stats?.customers?.newToday ?? 0} color="bg-gray-50 text-gray-700" />
          </div>
          <div className="px-5 pb-5">
            <Link href="/admin/users">
              <button className="w-full h-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Manage in Admin →
              </button>
            </Link>
          </div>
        </div>

        {/* Vendors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 grid place-items-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Vendors</h2>
                <p className="text-xs text-muted-foreground">Laundry shop partners</p>
              </div>
            </div>
            <Link href="/vendor/dashboard">
              <div className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:gap-1 transition-all">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
          <div className="p-5 space-y-2">
            <Pill label="Total vendors" value={stats?.vendors?.total ?? 0} color="bg-indigo-50 text-indigo-700" />
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="font-bold text-sm text-emerald-700">{stats?.vendors?.active ?? 0}</p>
                <p className="text-[10px] text-emerald-600">Active</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center">
                <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="font-bold text-sm text-amber-700">{stats?.vendors?.pending ?? 0}</p>
                <p className="text-[10px] text-amber-600">Pending</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-center">
                <XCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <p className="font-bold text-sm text-red-600">{stats?.vendors?.suspended ?? 0}</p>
                <p className="text-[10px] text-red-500">Suspended</p>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <Link href="/admin/vendors">
              <button className="w-full h-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Manage in Admin →
              </button>
            </Link>
          </div>
        </div>

        {/* Delivery Boys */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 grid place-items-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Delivery Boys</h2>
                <p className="text-xs text-muted-foreground">On-ground delivery partners</p>
              </div>
            </div>
            <Link href="/delivery/orders">
              <div className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:gap-1 transition-all">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
          <div className="p-5 space-y-2">
            <Pill label="Total delivery partners" value={stats?.deliveryBoys?.total ?? 0} color="bg-orange-50 text-orange-700" />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <p className="font-bold text-base text-emerald-700">{stats?.deliveryBoys?.online ?? 0}</p>
                <p className="text-xs text-emerald-600">Online now</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center">
                <p className="font-bold text-base text-amber-700">{stats?.deliveryBoys?.pendingKyc ?? 0}</p>
                <p className="text-xs text-amber-600">KYC Pending</p>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <Link href="/admin/delivery-boys">
              <button className="w-full h-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Manage in Admin →
              </button>
            </Link>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 grid place-items-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Orders</h2>
                <p className="text-xs text-muted-foreground">All platform orders</p>
              </div>
            </div>
            <Link href="/admin/orders">
              <div className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:gap-1 transition-all">
                View <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
          <div className="p-5 space-y-2">
            <Pill label="Total orders" value={stats?.orders?.total ?? 0} color="bg-teal-50 text-teal-700" />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-amber-50 p-3">
                <p className="text-[10px] text-amber-600 font-medium mb-0.5">New / Placed</p>
                <p className="font-extrabold text-lg text-amber-700">{stats?.orders?.placed ?? 0}</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3">
                <p className="text-[10px] text-indigo-600 font-medium mb-0.5">In Progress</p>
                <p className="font-extrabold text-lg text-indigo-700">{stats?.orders?.inProgress ?? 0}</p>
              </div>
            </div>
            <Pill label="Delivered today" value={stats?.orders?.today ?? 0} color="bg-emerald-50 text-emerald-700" />
          </div>
          <div className="px-5 pb-5">
            <Link href="/admin/orders">
              <button className="w-full h-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Manage in Admin →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
