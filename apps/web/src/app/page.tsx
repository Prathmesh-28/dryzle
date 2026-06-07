import { redirect } from 'next/navigation';

// Middleware handles actual redirect; this is a fallback.
export default function RootPage() {
  redirect('/login');
}
