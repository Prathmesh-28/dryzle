import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dryzle – Laundry at your doorstep',
  description: 'Order laundry pickup & delivery from nearby vendors',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
