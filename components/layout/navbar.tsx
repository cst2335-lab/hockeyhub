// components/layout/navbar.tsx
'use client';

import Link from 'next/link';
import {useEffect, useState, useMemo, useCallback, Suspense} from 'react';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {createClient} from '@/lib/supabase/client';
import {User} from '@supabase/supabase-js';
import {Home, Users, MapPin, Bell, LogOut, User as UserIcon} from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Logo } from '@/components/ui/logo';

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

const SUPPORTED = new Set(['en', 'fr']);

export default function Navbar() {
  const t = useTranslations('nav');
  const tActions = useTranslations('actions');
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
    <header className="sticky top-0 z-40 bg-[#18304B] text-sky-100 shadow-lg border-b border-sky-900/50">
      <nav className="container mx-auto h-16 px-4 flex items-center justify-between">
        <Link href={withLocale('/')} className="group" aria-label="Go home">
          <Logo size="md" showText={true} light={false} className="group-hover:opacity-90 transition-opacity" />
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-[15px]">
          <li>
            <Link
              href={withLocale('/games')}
              className={cx(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg transition',
                isActive('/games')
                  ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-50'
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
                  ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-50'
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
                  ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                  : 'text-slate-700 hover:text-sky-700 hover:bg-slate-50'
              )}
            >
              <MapPin className="h-4 w-4" /> {t('rinks')}
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          {/* ✅ 用 Suspense 包裹 LocaleSwitcher */}
          <Suspense fallback={<div className="w-20 h-8" />}>
            <LocaleSwitcher />
          </Suspense>

          {user ? (
            <>
              <Link
                href={withLocale('/notifications')}
                className="hidden sm:inline-flex h-9 items-center gap-2 px-3 rounded-lg relative
                           text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition"
                aria-label={unreadCount > 0 ? `${t('notifications')} (${unreadCount} unread)` : t('notifications')}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {t('notifications')}
              </Link>

              <Link
                href={withLocale('/games/new')}
                className="hidden sm:inline-flex h-9 items-center px-4 rounded-lg text-white
                           bg-gradient-to-r from-blue-600 to-sky-500 hover:to-sky-400
                           shadow hover:shadow-md transition"
              >
                {tActions('join')}
              </Link>

              <div className="relative group">
                <button
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-slate-100
                             hover:bg-slate-200 text-slate-700"
                  aria-label="Open user menu"
                >
                  <UserIcon className="h-5 w-5" />
                </button>
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-lg border shadow-lg py-2
                             invisible opacity-0 group-hover:visible group-hover:opacity-100
                             transition"
                >
                  <Link href={withLocale('/profile')} className="block px-3 py-2 text-sm hover:bg-slate-50">
                    {t('profile')}
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
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
                className="h-9 inline-flex items-center px-3 rounded-lg text-slate-700
                           hover:text-sky-700 hover:bg-slate-50 transition"
              >
                {t('login')}
              </Link>
              <Link
                href={withLocale('/register')}
                className="h-9 inline-flex items-center px-4 rounded-lg text-white
                           bg-gradient-to-r from-blue-600 to-sky-500 hover:to-sky-400
                           shadow hover:shadow-md transition"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />
    </header>
  );
}