// components/layout/navbar.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  Home,
  Users,
  MapPin,
  Bell,
  LogOut,
  User as UserIcon,
  Info,
  Search,
  Menu as Bars3Icon,
  X,
  ChevronDown,
} from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { Container } from '@/components/ui/container';
import { UserAvatar } from '@/components/ui/user-avatar';

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

const SUPPORTED = new Set(['en', 'fr']);

/* Figma: 多按钮 + Community 下拉，不堆叠 */
const directNavItems = [
  { href: '/games', labelKey: 'games' as const, icon: Home },
  { href: '/about', labelKey: 'about' as const, icon: Info },
] as const;
const communityDropdownItems = [
  { href: '/clubs', labelKey: 'clubs' as const, icon: Users },
  { href: '/rinks', labelKey: 'rinks' as const, icon: MapPin },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tActions = useTranslations('actions');
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string | null } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const seg = pathname?.split('/').filter(Boolean)[0] ?? '';
  const locale = SUPPORTED.has(seg as string) ? (seg as 'en' | 'fr') : 'en';
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  const loadUnreadCount = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', u.id)
      .eq('is_read', false);
    setUnreadCount(count ?? 0);
  }, [supabase]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let channelCleanup: (() => void) | undefined;
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
      if (u) {
        const { data: p } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', u.id).maybeSingle();
        setProfile(p as { full_name?: string; avatar_url?: string | null } | null);
        loadUnreadCount();
        const ch = supabase
          .channel('navbar-notifications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${u.id}` }, loadUnreadCount)
          .subscribe();
        channelCleanup = () => supabase.removeChannel(ch);
      } else {
        setProfile(null);
      }
      const { data } = supabase.auth.onAuthStateChange(async (_e, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const { data: p } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', u.id).maybeSingle();
          setProfile(p as { full_name?: string; avatar_url?: string | null } | null);
          loadUnreadCount();
        } else {
          setProfile(null);
          setUnreadCount(0);
        }
      });
      unsub = () => data.subscription.unsubscribe();
    })();
    return () => {
      unsub?.();
      channelCleanup?.();
    };
  }, [supabase, loadUnreadCount]);

  const isActive = (href: string) => pathname?.startsWith(withLocale(href));

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.user_metadata as Record<string, unknown>)?.name ||
    user?.email ||
    '';

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = withLocale('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    window.location.href = withLocale(q ? `/games?q=${encodeURIComponent(q)}` : '/games');
  };

  /* Figma: deep blue bar, white text — 纯色无磨砂 */
  const linkClass = (active: boolean) =>
    cx(
      'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition',
      active
        ? 'bg-gogo-primary-hover text-white ring-1 ring-gogo-secondary'
        : 'text-white hover:bg-gogo-primary-hover'
    );

  return (
    <Disclosure
      as="header"
      className="group sticky top-0 z-40 bg-gogo-primary text-white shadow-lg border-b border-gogo-secondary transition-colors"
    >
      <Container>
        <div className="relative flex h-16 items-center justify-between gap-4">
          {/* Logo + Desktop nav links */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link href={withLocale('/')} className="shrink-0 group" aria-label="Go home">
              <Logo size="md" showText={false} light={true} className="group-hover:opacity-90 transition-opacity" />
            </Link>
            <nav className="hidden lg:flex lg:items-center lg:gap-1">
              {directNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={withLocale(item.href)}
                    className={linkClass(isActive(item.href))}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <Menu as="div" className="relative">
                <MenuButton className={linkClass(communityDropdownItems.some((c) => isActive(c.href)))}>
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{t('community')}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute left-0 z-10 mt-1 w-44 origin-top-left rounded-md border border-border bg-card py-1 shadow-lg focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
                >
                  {communityDropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <MenuItem key={item.href + item.labelKey}>
                        <Link
                          href={withLocale(item.href)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground data-[focus]:bg-muted"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {t(item.labelKey)}
                        </Link>
                      </MenuItem>
                    );
                  })}
                </MenuItems>
              </Menu>
            </nav>
          </div>

          {/* Centered search (desktop) */}
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
                  className="block w-full rounded-md border border-gogo-secondary bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gogo-secondary focus:outline-none focus:ring-1 focus:ring-gogo-secondary"
                />
              </div>
            </form>
          </div>

          {/* Right: theme, locale, notifications, user menu — white on blue */}
          <div className="flex items-center gap-1 sm:gap-2 [&_.text-muted-foreground]:text-sky-100 [&_button]:text-white [&_a]:text-white [&_a.bg-white]:text-gogo-primary shrink-0">
            <ThemeToggle />
            <Suspense fallback={<div className="w-16 h-8 shrink-0" />}>
              <LocaleSwitcher />
            </Suspense>
            {user ? (
              <>
                <Link
                  href={withLocale('/notifications')}
                  className="relative shrink-0 rounded-lg p-2 text-white hover:bg-gogo-primary-hover focus:outline-2 focus:outline-offset-2 focus:outline-white"
                  aria-label={unreadCount > 0 ? `${t('notifications')} (${unreadCount} unread)` : t('notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Menu as="div" className="relative shrink-0">
                  <MenuButton className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gogo-primary-hover transition focus:outline-2 focus:outline-offset-2 focus:outline-white min-w-0 max-w-[200px] sm:max-w-none">
                    <span className="sr-only">Open user menu</span>
                    <UserAvatar
                      src={profile?.avatar_url ?? ((user?.user_metadata as Record<string, unknown>)?.avatar_url as string | undefined)}
                      name={profile?.full_name ?? ((user?.user_metadata as Record<string, unknown>)?.full_name as string | undefined)}
                      email={user?.email ?? undefined}
                      size="sm"
                      onDark
                      className="shrink-0 border-2 border-white/50"
                    />
                    <span className="hidden sm:inline-block text-sm text-sky-100 truncate max-w-[140px]" title={displayName}>
                      {displayName || '…'}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-card py-1 shadow-lg ring-1 ring-border focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
                  >
                    <MenuItem>
                      <Link
                        href={withLocale('/profile')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground data-[focus]:bg-muted"
                      >
                        <UserIcon className="h-4 w-4" />
                        {t('profile')}
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        href={withLocale('/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground data-[focus]:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t('dashboard')}
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground data-[focus]:bg-muted"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('logout')}
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  href={withLocale('/login')}
                  className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-gogo-primary-hover"
                >
                  {t('login')}
                </Link>
                <Link
                  href={withLocale('/register')}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gogo-primary bg-white hover:bg-gray-100 focus:outline-2 focus:outline-offset-2 focus:outline-white"
                >
                  {t('register')}
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-gogo-primary-hover focus:outline-2 focus:outline-white">
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="size-6 group-data-[open]:hidden" aria-hidden />
                <X className="hidden size-6 group-data-[open]:block" aria-hidden />
              </DisclosureButton>
            </div>
          </div>
        </div>
      </Container>

      <DisclosurePanel className="lg:hidden border-t border-gogo-secondary bg-gogo-primary">
        <div className="space-y-1 px-4 pt-2 pb-4">
          <form onSubmit={handleSearchSubmit} className="pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tHero('searchPlaceholder')}
                className="block w-full rounded-md border border-gogo-secondary bg-white py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </form>
          {user && (
            <DisclosureButton as={Link} href={withLocale('/dashboard')} className={cx('block w-full rounded-md px-3 py-2 text-base font-medium', linkClass(isActive('/dashboard')))}>
              <LayoutDashboard className="inline h-4 w-4 mr-2" />
              {t('dashboard')}
            </DisclosureButton>
          )}
          {directNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <DisclosureButton
                key={item.href}
                as={Link}
                href={withLocale(item.href)}
                className={cx('block w-full rounded-md px-3 py-2 text-base font-medium', linkClass(isActive(item.href)))}
              >
                <Icon className="inline h-4 w-4 mr-2" />
                {t(item.labelKey)}
              </DisclosureButton>
            );
          })}
          {communityDropdownItems.map((item) => {
            const Icon = item.icon;
            return (
              <DisclosureButton
                key={item.href}
                as={Link}
                href={withLocale(item.href)}
                className={cx('block w-full rounded-md px-3 py-2 text-base font-medium', linkClass(isActive(item.href)))}
              >
                <Icon className="inline h-4 w-4 mr-2" />
                {t(item.labelKey)}
              </DisclosureButton>
            );
          })}
        </div>
        {user && (
          <div className="border-t border-gogo-secondary px-4 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={profile?.avatar_url ?? ((user?.user_metadata as Record<string, unknown>)?.avatar_url as string | undefined)}
                name={profile?.full_name ?? ((user?.user_metadata as Record<string, unknown>)?.full_name as string | undefined)}
                email={user?.email ?? undefined}
                size="md"
                onDark
                className="shrink-0 border-2 border-white/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sky-100 truncate">
                  {displayName || user.email || '…'}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <DisclosureButton as={Link} href={withLocale('/profile')} className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gogo-primary-hover">
                {t('profile')}
              </DisclosureButton>
              <DisclosureButton as={Link} href={withLocale('/dashboard')} className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gogo-primary-hover">
                {t('dashboard')}
              </DisclosureButton>
              <DisclosureButton
                as="button"
                onClick={logout}
                className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-white hover:bg-gogo-primary-hover"
              >
                {t('logout')}
              </DisclosureButton>
            </div>
          </div>
        )}
      </DisclosurePanel>

      <div className="h-[3px] w-full bg-gradient-to-r from-gogo-primary via-gogo-secondary to-gogo-primary" />
    </Disclosure>
  );
}
