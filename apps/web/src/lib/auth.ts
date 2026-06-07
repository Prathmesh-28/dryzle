export type Role = "CUSTOMER" | "VENDOR" | "DELIVERY_BOY" | "ADMIN" | "SUPER_ADMIN";

const TOKEN_KEY = "dryzle_token";
const USER_KEY = "dryzle_user";

export interface AuthUser {
  id?: string;
  phone?: string;
  role: Role;
  name?: string;
  [k: string]: unknown;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(USER_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as AuthUser;
    } catch {
      /* ignore */
    }
  }
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || !payload.role) return null;
  return payload as AuthUser;
}

export function saveAuth(token: string, user?: Partial<AuthUser>): AuthUser | null {
  if (typeof window === "undefined") return null;
  localStorage.setItem(TOKEN_KEY, token);
  const payload = decodeJwt(token) || {};
  const merged = { ...(payload as Record<string, unknown>), ...(user || {}) } as AuthUser;
  if (!merged.role) return null;
  localStorage.setItem(USER_KEY, JSON.stringify(merged));
  return merged;
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function roleHomePath(role: Role | string | undefined): string {
  switch (role) {
    case "CUSTOMER":
      return "/customer";
    case "VENDOR":
      return "/vendor/dashboard";
    case "DELIVERY_BOY":
      return "/delivery/orders";
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPER_ADMIN":
      return "/superadmin/dashboard";
    default:
      return "/login";
  }
}
