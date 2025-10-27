'use client';

import {useEffect, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {Home, Trophy, MapPin, Calendar, Users, Bell, LogOut, FileText} from 'lucide-react';

/**
 * Dashboard shell (top nav + children)
 * - Derives `locale` from the first URL segment: /{locale}/...
 * - Localizes all nav links and redirects to `/${locale}/...`
 */
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Resolve locale from path: ['', '{locale}', ...]
  const locale = (pathname?.split('/')?.[1] || '').trim();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Build a localized href safely (avoid double slashes)
  const withLocale = (p: string) => `/${locale || ''}${p}`.replace('//', '/');

  useEffect(() => {
    checkUser();
    loadUnreadCount();

    // Subscribe to realtime notifications for the current user
    let cleanup: (() => void) | undefined;

    (async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('unread-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadUnreadCount();
          }
        )
        .subscribe();

      cleanup = () => supabase.removeChannel(channel);
    })();

    return () => {
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkUser() {
    const {
      data: {user}
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || null);
    } else {
      // Localized redirect when unauthenticated
      router.push(withLocale('/login'));
    }
  }

  async function loadUnreadCount() {
    try {
      const {
        data: {user}
      } = await supabase.auth.getUser();
      if (!user) return;

      const {count} = await supabase
        .from('notifications')
        .select('*', {count: 'exact', head: true})
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    // Localized redirect after logout
    router.push(withLocale('/login'));
  }

  // Define nav items without locale; we prepend it via `withLocale`
  const navItems = [
    {path: '/dashboard', label: 'Dashboard', icon: Home},
    {path: '/games', label: 'Games', icon: Trophy},
    {path: '/my-games', label: 'My Games', icon: FileText},
    {path: '/rinks', label: 'Rinks', icon: MapPin},
    {path: '/bookings', label: 'My Bookings', icon: Calendar},
    {path: '/clubs', label: 'Clubs', icon: Users}
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo + Desktop Nav */}
            <div className="flex">
              <Link href={withLocale('/dashboard')} className="flex items-center px-2">
                <span className="text-2xl">🏒</span>
                <span className="ml-2 text-xl font-bold text-gray-900">HockeyHub</span>
              </Link>

              <div className="hidden md:ml-8 md:flex md:space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const href = withLocale(item.path);
                  const isActive =
                    pathname === href ||
                    (item.path !== '/dashboard' && pathname?.startsWith(href));

                  return (
                    <Link
                      key={item.path}
                      href={href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Link
                href={withLocale('/notifications')}
                className={`relative p-2 rounded-full transition ${
                  pathname === withLocale('/notifications')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs text-center leading-4">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User section */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 hidden sm:block">{userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const href = withLocale(item.path);
              const isActive =
                pathname === href || (item.path !== '/dashboard' && pathname?.startsWith(href));

              return (
                <Link
                  key={item.path}
                  href={href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="inline h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
