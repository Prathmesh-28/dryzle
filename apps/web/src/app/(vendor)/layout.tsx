'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

const NAV = [
  { href: '/vendor/dashboard', label: 'Dashboard' },
  { href: '/vendor/orders', label: 'Orders' },
  { href: '/vendor/services', label: 'Services' },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  function logout() { document.cookie = 'dryzle_token=;path=/;max-age=0'; clearAuth(); router.push('/login'); }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r flex flex-col py-6 px-4 shrink-0">
        <h1 className="font-bold text-indigo-600 text-xl mb-8">Dryzle Vendor</h1>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${pathname.startsWith(n.href) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 text-left px-3">Logout</button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
