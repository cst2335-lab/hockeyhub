'use client';

import {useEffect, useState, Suspense} from 'react';
import {createClient} from '@/lib/supabase/client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {LayoutDashboard, Trophy, MapPin, Users, Bell, LogOut, Settings, User, ChevronDown, Search, Menu as Bars3Icon, X} from 'lucide-react';
import {Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import {Logo} from '@/components/ui/logo';
import {UserAvatar} from '@/components/ui/user-avatar';
import {Container} from '@/components/ui/container';
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
  const tHero = useTranslations('hero');
  const tActions = useTranslations('actions');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Resolve locale from path: ['', '{locale}', ...]
  const locale = (pathname?.split('/')?.[1] || '').trim();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinkManager, setIsRinkManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        supabase.from('profiles').select('role, full_name, avatar_url').eq('id', user.id).maybeSingle(),
        supabase.from('rink_managers').select('id').eq('user_id', user.id).eq('verified', true).maybeSingle(),
      ]);
      const profile = profileRes.error ? null : (profileRes.data as { role?: string; full_name?: string; avatar_url?: string } | null);
      const meta = user.user_metadata as Record<string, unknown> | undefined;
      setUserName((profile?.full_name ?? meta?.full_name ?? meta?.name ?? null) as string | null);
      setAvatarUrl((profile?.avatar_url ?? meta?.avatar_url ?? null) as string | null);
      const hasRinkManagerRole = profile?.role === 'rink_manager' || !!manager;
      setIsRinkManager(!!hasRinkManagerRole);
    } else {
      setIsRinkManager(false);
      setUserName(null);
      setAvatarUrl(null);
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
    router.push(withLocale('/login'));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(withLocale(q ? `/games?q=${encodeURIComponent(q)}` : '/games'));
  }

  const playItems = [
    {path: '/rinks', labelKey: 'rinks', icon: MapPin},
    {path: '/games', labelKey: 'games', icon: Trophy},
  ] as const;
  const communityItems = [
    {path: '/clubs', labelKey: 'clubs', icon: Users},
  ] as const;

  const isPlayActive = playItems.some((i) => pathname === withLocale(i.path) || pathname?.startsWith(withLocale(i.path) + '/'));
  const isCommunityActive = communityItems.some((i) => pathname === withLocale(i.path) || pathname?.startsWith(withLocale(i.path) + '/'));
  const isDashboardActive = pathname === withLocale('/dashboard');

  const navLinkClass = (active: boolean) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
      active ? 'bg-gogo-primary-hover text-white ring-1 ring-gogo-secondary' : 'text-white hover:bg-gogo-primary-hover'
    }`;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation — Disclosure pattern like main Navbar, no overflow scrollbar */}
      <Disclosure
        as="header"
        className="group sticky top-0 z-40 bg-gogo-primary text-white shadow-lg border-b border-gogo-secondary transition-colors"
      >
        <Container>
        <div className="relative flex h-16 items-center justify-between gap-4">
          {/* Logo + desktop nav — lg only, no overflow */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <Link href={withLocale('/')} className="group shrink-0" aria-label="Go home">
              <Logo size="md" showText={false} light={true} className="group-hover:opacity-90 transition-opacity" />
            </Link>

            <nav className="hidden lg:flex lg:items-center lg:gap-1">
              <Link
                href={withLocale('/dashboard')}
                className={navLinkClass(isDashboardActive)}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {t('dashboard')}
              </Link>
              <Menu as="div" className="relative">
                <MenuButton className={navLinkClass(isPlayActive)}>
                  <Trophy className="h-4 w-4 shrink-0" />
                  {t('play')}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </MenuButton>
                <MenuItems className="absolute left-0 z-10 mt-1 w-44 origin-top-left rounded-md border border-border bg-card py-1 shadow-lg text-foreground focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in">
                  {playItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <MenuItem key={item.path}>
                        <Link href={withLocale(item.path)} className="flex items-center gap-2 px-4 py-2 text-sm data-[focus]:bg-muted">
                          <Icon className="h-4 w-4 shrink-0" />
                          {t(item.labelKey)}
                        </Link>
                      </MenuItem>
                    );
                  })}
                </MenuItems>
              </Menu>
              <Menu as="div" className="relative">
                <MenuButton className={navLinkClass(isCommunityActive)}>
                  <Users className="h-4 w-4 shrink-0" />
                  {t('community')}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </MenuButton>
                <MenuItems className="absolute left-0 z-10 mt-1 w-44 origin-top-left rounded-md border border-border bg-card py-1 shadow-lg text-foreground focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in">
                  {communityItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <MenuItem key={item.path}>
                        <Link href={withLocale(item.path)} className="flex items-center gap-2 px-4 py-2 text-sm data-[focus]:bg-muted">
                          <Icon className="h-4 w-4 shrink-0" />
                          {t(item.labelKey)}
                        </Link>
                      </MenuItem>
                    );
                  })}
                </MenuItems>
              </Menu>
              {isRinkManager && (
                <Link
                  href={withLocale('/manage-rink')}
                  className={navLinkClass(pathname?.includes('/manage-rink') ?? false)}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  {t('manageRink')}
                </Link>
              )}
            </nav>
          </div>

          {/* Centered search — same as main Navbar */}
          <div className="hidden flex-1 justify-center px-4 lg:flex lg:max-w-xs">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tHero('searchPlaceholder')}
                  aria-label={tActions('search')}
                  className="block w-full rounded-md border border-gogo-secondary bg-white py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gogo-secondary focus:outline-none focus:ring-1 focus:ring-gogo-secondary"
                />
              </div>
            </form>
          </div>

          {/* Right: theme, locale, notifications, user, hamburger — same as main Navbar */}
          <div className="flex items-center gap-1 sm:gap-2 [&_.text-muted-foreground]:text-sky-100 [&_button]:text-white [&_a]:text-white [&_a.bg-white]:text-gogo-primary shrink-0">
            <ThemeToggle />
            <Suspense fallback={<div className="w-16 h-8 shrink-0" />}>
              <LocaleSwitcher />
            </Suspense>
            <Link
              href={withLocale('/notifications')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg relative text-white hover:bg-gogo-primary-hover transition"
              aria-label={unreadCount > 0 ? `${t('notifications')} (${unreadCount} unread)` : t('notifications')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Menu as="div" className="relative shrink-0">
              <MenuButton className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gogo-primary-hover transition min-w-0 max-w-[200px] sm:max-w-none">
                <UserAvatar
                  src={avatarUrl}
                  name={userName}
                  email={userEmail}
                  size="sm"
                  onDark
                  className="shrink-0 border-2 border-white/50"
                />
                <span className="hidden sm:inline-block text-sm text-sky-100 truncate max-w-[140px]" title={userName ?? userEmail ?? undefined}>
                  {userName || userEmail || '…'}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </MenuButton>
              <MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md border border-border bg-card py-1 shadow-lg text-foreground focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in">
                <MenuItem>
                  <Link href={withLocale('/profile')} className="flex items-center gap-2 px-4 py-2 text-sm data-[focus]:bg-muted">
                    <User className="h-4 w-4 shrink-0" />
                    {t('profile')}
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href={withLocale('/dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm data-[focus]:bg-muted">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    {t('dashboard')}
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm data-[focus]:bg-muted text-left">
                    <LogOut className="h-4 w-4 shrink-0" />
                    {t('logout')}
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>

            {/* Hamburger — mobile only */}
            <div className="flex lg:hidden">
              <DisclosureButton className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-gogo-primary-hover focus:outline-2 focus:outline-white">
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="size-6 group-data-[open]:hidden" aria-hidden />
                <X className="hidden size-6 group-data-[open]:block" aria-hidden />
              </DisclosureButton>
            </div>
          </div>
        </div>
        </Container>

        {/* Mobile panel — collapsible like main Navbar */}
        <DisclosurePanel className="lg:hidden border-t border-gogo-secondary bg-gogo-primary">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-1">
            <form onSubmit={handleSearchSubmit} className="pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tHero('searchPlaceholder')}
                  className="block w-full rounded-md border border-gogo-secondary bg-white py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </form>
            <Link
              href={withLocale('/dashboard')}
              className={`block px-3 py-2 rounded-lg text-[15px] font-medium transition ${
                isDashboardActive ? 'bg-gogo-primary-hover text-white ring-1 ring-gogo-secondary' : 'text-white hover:bg-gogo-primary-hover'
              }`}
            >
              <LayoutDashboard className="inline h-4 w-4 mr-2 align-middle" />
              {t('dashboard')}
            </Link>
            {playItems.map((item) => {
              const Icon = item.icon;
              const href = withLocale(item.path);
              const active = pathname === href || pathname?.startsWith(href + '/');
              return (
                <Link key={item.path} href={href} className={`block px-3 py-2 rounded-lg text-[15px] font-medium transition ${active ? 'bg-gogo-primary-hover text-white ring-1 ring-gogo-secondary' : 'text-white hover:bg-gogo-primary-hover'}`}>
                  <Icon className="inline h-4 w-4 mr-2 align-middle" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
            {communityItems.map((item) => {
              const Icon = item.icon;
              const href = withLocale(item.path);
              const active = pathname === href || pathname?.startsWith(href + '/');
              return (
                <Link key={item.path} href={href} className={`block px-3 py-2 rounded-lg text-[15px] font-medium transition ${active ? 'bg-gogo-primary-hover text-white ring-1 ring-gogo-secondary' : 'text-white hover:bg-gogo-primary-hover'}`}>
                  <Icon className="inline h-4 w-4 mr-2 align-middle" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
            {isRinkManager && (
              <Link
                href={withLocale('/manage-rink')}
                className={`block px-3 py-2 rounded-lg text-[15px] font-medium transition ${pathname?.includes('/manage-rink') ? 'bg-gogo-primary-hover text-white ring-1 ring-gogo-secondary' : 'text-white hover:bg-gogo-primary-hover'}`}
              >
                <Settings className="inline h-4 w-4 mr-2 align-middle" />
                {t('manageRink')}
              </Link>
            )}
          </div>
        </DisclosurePanel>

        <div className="h-[3px] w-full bg-gradient-to-r from-gogo-primary via-gogo-secondary to-gogo-primary" />
      </Disclosure>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}
