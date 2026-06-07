'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

const NAV = [
  { href: '/delivery/orders', label: 'Orders' },
  { href: '/delivery/earnings', label: 'Earnings' },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  function logout() { document.cookie = 'dryzle_token=;path=/;max-age=0'; clearAuth(); router.push('/login'); }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-indigo-600">Dryzle Delivery</span>
          <nav className="flex gap-4 text-sm items-center">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                className={pathname.startsWith(n.href) ? 'text-indigo-600 font-semibold' : 'text-gray-600'}>
                {n.label}
              </Link>
            ))}
            <button onClick={logout} className="text-gray-400 hover:text-red-500 text-sm">Logout</button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">{children}</main>
    </div>
  );
}
