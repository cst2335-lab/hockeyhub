'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import Footer from './footer';

/** Dashboard route segments - when present, we use the dashboard layout's own nav, hide main Navbar/Footer */
const DASHBOARD_SEGMENTS = new Set([
  'dashboard', 'games', 'my-games', 'rinks', 'bookings', 'clubs',
  'notifications', 'profile', 'manage-rink', 'book', 'games-test',
]);

export function ConditionalNavbar() {
  const pathname = usePathname();
  const segs = pathname?.split('/').filter(Boolean) ?? [];
  const second = segs[1];
  if (second && DASHBOARD_SEGMENTS.has(second)) return null;
  return <Navbar />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  const segs = pathname?.split('/').filter(Boolean) ?? [];
  const second = segs[1];
  if (second && DASHBOARD_SEGMENTS.has(second)) return null;
  return <Footer />;
}
