'use client';

import {useEffect, useState, Suspense} from 'react';
import {createClient} from '@/lib/supabase/client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import {LayoutDashboard, Trophy, MapPin, Calendar, Users, Bell, LogOut, FileText, Settings, Menu as Bars3Icon, ChevronDown} from 'lucide-react';
import {Logo} from '@/components/ui/logo';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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

  // Route guard: /manage-rink only for rink_manager
  useEffect(() => {
    if (userEmail == null) return;
    const isManageRink = pathname?.includes('/manage-rink');
    if (isManageRink && !isRinkManager) {
      router.replace(withLocale('/dashboard'));
    }
  }, [userEmail, pathname, isRinkManager, router, withLocale]);

  async function checkUser() {
    const {
      data: {user}
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || null);
      const [profileRes, { data: manager }] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
        supabase.from('rink_managers').select('id').eq('user_id', user.id).eq('verified', true).maybeSingle(),
      ]);
      const profile = profileRes.error ? null : profileRes.data;
      const hasRinkManagerRole = (profile as { role?: string } | null)?.role === 'rink_manager' || !!manager;
      setIsRinkManager(!!hasRinkManagerRole);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - theme-aware like main Navbar */}
      <header className="sticky top-0 z-40 bg-gogo-primary text-white shadow-lg border-b border-white/20 transition-colors">
        <nav className="container mx-auto h-14 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <Link href={withLocale('/')} className="group" aria-label="Go home">
              <Logo size="md" showText={true} light={true} className="group-hover:opacity-90 transition-opacity" />
            </Link>

            <Menu as="div" className="relative hidden md:block">
              <MenuButton className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition">
                <Bars3Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{t('menu')}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              </MenuButton>
              <MenuItems
                transition
                className="absolute left-0 z-10 mt-1 w-52 origin-top-left rounded-md border border-border bg-card py-1 shadow-lg text-foreground focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
              >
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
                      <MenuItem key={item.path}>
                        <Link
                          href={href}
                          className={`flex items-center gap-2 px-4 py-2 text-sm data-[focus]:bg-muted ${
                            active ? 'text-gogo-primary font-medium' : 'text-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {t(item.labelKey)}
                        </Link>
                      </MenuItem>
                    );
                  })}
              </MenuItems>
            </Menu>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 [&_button]:text-white [&_a]:text-white shrink-0">
            <ThemeToggle />
            <Suspense fallback={<div className="w-20 h-8" />}>
              <LocaleSwitcher />
            </Suspense>

            <Link
              href={withLocale('/notifications')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg relative text-white hover:bg-white/10 transition"
              aria-label={unreadCount > 0 ? `${t('notifications')} (${unreadCount} unread)` : t('notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <span className="hidden sm:inline-block text-sm text-white/90 truncate max-w-[120px]" title={userEmail ?? undefined}>
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              aria-label={t('logout')}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-white hover:bg-white/10 transition whitespace-nowrap text-sm"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20 bg-gogo-primary">
          <div className="container mx-auto px-4 py-3 space-y-1 max-h-[60vh] overflow-y-auto">
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
                        ? 'bg-white/15 text-white ring-1 ring-white/40'
                        : 'text-white hover:bg-white/10'
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
