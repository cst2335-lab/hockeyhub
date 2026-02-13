'use client';

import {useEffect, useState, Suspense} from 'react';
import {createClient} from '@/lib/supabase/client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {LayoutDashboard, Trophy, MapPin, Calendar, Users, Bell, LogOut, FileText, Settings} from 'lucide-react';
import {Logo} from '@/components/ui/logo';
import LocaleSwitcher from '@/components/LocaleSwitcher';

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
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Resolve locale from path: ['', '{locale}', ...]
  const locale = (pathname?.split('/')?.[1] || '').trim();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinkManager, setIsRinkManager] = useState(false);

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
      const {data: manager} = await supabase
        .from('rink_managers')
        .select('id')
        .eq('user_id', user.id)
        .eq('verified', true)
        .maybeSingle();
      setIsRinkManager(!!manager);
    } else {
      setIsRinkManager(false);
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
  // rinkManagerOnly: only show for verified rink managers
  const navItems = [
    {path: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, rinkManagerOnly: false},
    {path: '/games', labelKey: 'games', icon: Trophy, rinkManagerOnly: false},
    {path: '/my-games', labelKey: 'myGames', icon: FileText, rinkManagerOnly: false},
    {path: '/rinks', labelKey: 'rinks', icon: MapPin, rinkManagerOnly: false},
    {path: '/bookings', labelKey: 'myBookings', icon: Calendar, rinkManagerOnly: false},
    {path: '/clubs', labelKey: 'clubs', icon: Users, rinkManagerOnly: false},
    {path: '/manage-rink', labelKey: 'manageRink', icon: Settings, rinkManagerOnly: true},
  ] as const;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || (pathname?.startsWith(href) ?? false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - same visual as main Navbar (homepage) */}
      <header className="sticky top-0 z-40 bg-[#18304B] text-sky-100 shadow-lg border-b border-sky-900/50">
        <nav className="container mx-auto h-16 px-4 flex items-center justify-between">
          <Link href={withLocale('/')} className="group" aria-label="Go home">
            <Logo size="md" showText={true} light className="group-hover:opacity-90 transition-opacity" />
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-[15px]">
            {navItems
              .filter((item) => !item.rinkManagerOnly || isRinkManager)
              .map((item) => {
                const Icon = item.icon;
                const href = withLocale(item.path);
                const active =
                  item.path === '/dashboard'
                    ? isActive(href, true)
                    : pathname?.startsWith(href);
                return (
                  <li key={item.path}>
                    <Link
                      href={href}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                        active
                          ? 'bg-white/20 text-white ring-1 ring-white/30'
                          : 'text-sky-100 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {t(item.labelKey)}
                    </Link>
                  </li>
                );
              })}
          </ul>

          <div className="flex items-center gap-3">
            <Suspense fallback={<div className="w-20 h-8" />}>
              <LocaleSwitcher />
            </Suspense>

            <Link
              href={withLocale('/notifications')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg relative text-sky-100 hover:text-white hover:bg-white/10 transition"
              aria-label={unreadCount > 0 ? `${t('notifications')} (${unreadCount} unread)` : t('notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <span className="hidden sm:inline-block text-sm text-sky-100 truncate max-w-[140px]" title={userEmail ?? undefined}>
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              aria-label={t('logout')}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sky-100 hover:text-white hover:bg-white/10 transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-sky-900/50">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navItems
              .filter((item) => !item.rinkManagerOnly || isRinkManager)
              .map((item) => {
                const Icon = item.icon;
                const href = withLocale(item.path);
                const active =
                  item.path === '/dashboard'
                    ? pathname === href
                    : pathname?.startsWith(href);
                return (
                  <Link
                    key={item.path}
                    href={href}
                    className={`block px-3 py-2 rounded-lg text-[15px] font-medium transition ${
                      active
                        ? 'bg-white/20 text-white ring-1 ring-white/30'
                        : 'text-sky-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="inline h-4 w-4 mr-2 align-middle" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="h-[3px] w-full bg-gradient-to-r from-gogo-primary via-gogo-secondary to-gogo-primary" />
      </header>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
