"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getUser, roleHomePath, type Role } from "@/lib/auth";

export function RoleGuard({
  allow,
  children,
}: {
  allow: Role;
  children: ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u?.role) {
      router.push("/login");
    } else if (u.role !== allow) {
      router.push(roleHomePath(u.role));
    }
  }, [allow, router]);

  return <>{children}</>;
}
