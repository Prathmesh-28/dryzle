'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Layers, BarChart2, Settings, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

const nav = [
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/services', label: 'Services', icon: Layers },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-5 py-5 border-b border-gray-800">
        <h1 className="text-lg font-bold text-blue-400">Dryzle</h1>
        <p className="text-xs text-gray-400">Vendor Dashboard</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              pathname.startsWith(href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
