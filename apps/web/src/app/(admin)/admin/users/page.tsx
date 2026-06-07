"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface U {
  id: string;
  name?: string;
  phone?: string;
  role: string;
  createdAt?: string;
}

const TABS = ["ALL", "CUSTOMER", "VENDOR", "DELIVERY_BOY", "ADMIN"];

const ROLE_COLOR: Record<string, string> = {
  CUSTOMER: "bg-blue-100 text-blue-800",
  VENDOR: "bg-purple-100 text-purple-800",
  DELIVERY_BOY: "bg-amber-100 text-amber-800",
  ADMIN: "bg-red-100 text-red-800",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<U[] | null>(null);
  const [tab, setTab] = useState("ALL");

  useEffect(() => {
    apiGet<U[] | { users: U[] }>("/admin/users")
      .then((d) => setUsers(Array.isArray(d) ? d : d.users))
      .catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(
    () => (users ? users.filter((u) => tab === "ALL" || u.role === tab) : []),
    [users, tab],
  );

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </header>
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border",
              tab === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {t.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {!users ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    No users
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
                          ROLE_COLOR[u.role] || "bg-muted text-muted-foreground",
                        )}
                      >
                        {u.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtDate(u.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
