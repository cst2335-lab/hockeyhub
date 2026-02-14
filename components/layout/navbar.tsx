// components/layout/navbar.tsx
'use client';

import Link from 'next/link';
import {useEffect, useState, useMemo, useCallback, Suspense} from 'react';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {createClient} from '@/lib/supabase/client';
import {User} from '@supabase/supabase-js';
import {LayoutDashboard, Home, Users, MapPin, Bell, LogOut, User as UserIcon} from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { Container } from '@/components/ui/container';

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

const SUPPORTED = new Set(['en', 'fr']);

export default function Navbar() {
  const t = useTranslations('nav');
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const seg = pathname?.split('/').filter(Boolean)[0] ?? '';
  const locale = SUPPORTED.has(seg as any) ? (seg as 'en' | 'fr') : 'en';
  const withLocale = (p: string) => (`/${locale}${p}`).replace(/\/{2,}/g, '/');

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
        loadUnreadCount();
        const ch = supabase
          .channel('navbar-notifications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${u.id}` }, loadUnreadCount)
          .subscribe();
        channelCleanup = () => supabase.removeChannel(ch);
      }
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
        if (session?.user) loadUnreadCount();
        else setUnreadCount(0);
      });
      unsub = () => data.subscription.unsubscribe();
    })();
    return () => {
      unsub?.();
      channelCleanup?.();
    };
  }, [supabase, loadUnreadCount]);

  const isActive = (href: string) => pathname?.startsWith(withLocale(href));

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = withLocale('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#18304B] text-slate-800 dark:text-sky-100 shadow-lg border-b border-slate-200 dark:border-sky-900/50 transition-colors">
      <Container>
      <nav className="flex h-16 items-center justify-between">
        <Link href={withLocale('/')} className="group" aria-label="Go home">
          <Logo size="md" showText={true} light={false} className="group-hover:opacity-90 transition-opacity" />
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-[15px]">
          {user && (
            <li>
              <Link
                href={withLocale('/dashboard')}
                className={cx(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-lg transition',
                  isActive('/dashboard')
                    ? 'bg-gogo-primary/20 dark:bg-white/20 text-gogo-dark dark:text-white ring-1 ring-gogo-primary/40 dark:ring-white/30'
                    : 'text-slate-700 dark:text-sky-100 hover:text-gogo-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                )}
                aria-label={t('dashboard')}
              >
                <LayoutDashboard className="h-4 w-4" /> {t('dashboard')}
              </Link>
            </li>
          )}
          <li>
            <Link
              href={withLocale('/games')}
              className={cx(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg transition',
                isActive('/games')
                  ? 'bg-gogo-primary/20 dark:bg-white/20 text-gogo-dark dark:text-white ring-1 ring-gogo-primary/40 dark:ring-white/30'
                  : 'text-slate-700 dark:text-sky-100 hover:text-gogo-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              <Home className="h-4 w-4" /> {t('games')}
            </Link>
          </li>
          <li>
            <Link
              href={withLocale('/clubs')}
              className={cx(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg transition',
                isActive('/clubs')
                  ? 'bg-gogo-primary/20 dark:bg-white/20 text-gogo-dark dark:text-white ring-1 ring-gogo-primary/40 dark:ring-white/30'
                  : 'text-slate-700 dark:text-sky-100 hover:text-gogo-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              <Users className="h-4 w-4" /> {t('clubs')}
            </Link>
          </li>
          <li>
            <Link
              href={withLocale('/rinks')}
              className={cx(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg transition',
                isActive('/rinks')
                  ? 'bg-gogo-primary/20 dark:bg-white/20 text-gogo-dark dark:text-white ring-1 ring-gogo-primary/40 dark:ring-white/30'
                  : 'text-slate-700 dark:text-sky-100 hover:text-gogo-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              <MapPin className="h-4 w-4" /> {t('rinks')}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Suspense fallback={<div className="w-20 h-8" />}>
            <LocaleSwitcher />
          </Suspense>

          {user ? (
            <>
              <Link
                href={withLocale('/dashboard')}
                className="md:hidden inline-flex h-9 items-center gap-2 px-3 rounded-lg text-slate-700 dark:text-sky-100 hover:text-gogo-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                aria-label={t('dashboard')}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t('dashboard')}</span>
              </Link>
              <Link
                href={withLocale('/notifications')}
                className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg relative
                           text-slate-700 dark:text-sky-100 hover:text-gogo-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                aria-label={unreadCount > 0 ? `${t('notifications')} (${unreadCount} unread)` : t('notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative group inline-flex items-center gap-2">
                <span className="hidden sm:inline-block text-sm text-slate-700 dark:text-sky-100 truncate max-w-[140px]" title={user.email ?? undefined}>
                  {user.email}
                </span>
                <button
                  className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-100
                             hover:bg-slate-300 dark:hover:bg-slate-200 text-slate-700 dark:text-slate-700"
                  aria-label="Open user menu"
                >
                  <UserIcon className="h-5 w-5" />
                </button>
                <div
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg py-2
                             invisible opacity-0 group-hover:visible group-hover:opacity-100
                             transition text-slate-800 dark:text-slate-100"
                >
                  <Link href={withLocale('/profile')} className="block px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100">
                    {t('profile')}
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-800 dark:text-slate-100"
                  >
                    <LogOut className="h-4 w-4" /> {t('logout')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href={withLocale('/login')}
                className="h-9 inline-flex items-center px-3 rounded-lg text-slate-700 dark:text-sky-100
                           hover:text-gogo-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                {t('login')}
              </Link>
              <Link
                href={withLocale('/register')}
                className="h-9 inline-flex items-center px-4 rounded-lg text-white font-medium
                           bg-gradient-to-r from-gogo-primary to-gogo-secondary hover:to-gogo-secondary/90
                           shadow hover:shadow-md transition drop-shadow-sm"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </nav>
      </Container>

      <div className="h-[3px] w-full bg-gradient-to-r from-gogo-primary via-gogo-secondary to-gogo-primary" />
    </header>
  );
}