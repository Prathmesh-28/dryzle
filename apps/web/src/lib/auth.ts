import { JwtPayload } from '@dryzle/shared';

export const TOKEN_KEY = 'dryzle_token';
export const USER_KEY = 'dryzle_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): JwtPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveAuth(token: string, user: JwtPayload) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function roleHomePath(role: string): string {
  switch (role) {
    case 'VENDOR': return '/vendor/dashboard';
    case 'DELIVERY_BOY': return '/delivery/orders';
    case 'ADMIN': return '/admin/dashboard';
    default: return '/customer';
  }
}
