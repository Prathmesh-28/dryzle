import { NextRequest, NextResponse } from 'next/server';

// Auth temporarily disabled — uncomment below to re-enable
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};

/*
const PUBLIC_PATHS = ['/', '/login'];

const ROLE_HOME: Record<string, string> = {
  VENDOR: '/vendor/dashboard',
  DELIVERY_BOY: '/delivery/orders',
  ADMIN: '/admin/dashboard',
  CUSTOMER: '/customer',
};

const ROLE_PREFIX: Record<string, string> = {
  VENDOR: '/vendor',
  DELIVERY_BOY: '/delivery',
  ADMIN: '/admin',
  CUSTOMER: '/customer',
};

function decodeRole(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('dryzle_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = decodeRole(token);
  if (!role) return NextResponse.redirect(new URL('/login', req.url));

  if (pathname === '/') {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/login', req.url));
  }

  const allowedPrefix = ROLE_PREFIX[role];
  const crossRole = Object.values(ROLE_PREFIX).some(
    (prefix) => prefix !== allowedPrefix && pathname.startsWith(prefix),
  );
  if (crossRole) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/login', req.url));
  }

  return NextResponse.next();
}
*/
