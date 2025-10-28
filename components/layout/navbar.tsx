// components/layout/navbar.tsx
'use client';

import Link from 'next/link';
import {useEffect, useState, useMemo} from 'react';
import {usePathname} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';
import {User} from '@supabase/supabase-js';
import {Home, Users, MapPin, Bell, LogOut, User as UserIcon, Trophy} from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';

function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

const SUPPORTED = new Set(['en', 'fr']);

export default function Navbar() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  // === 从路径解析 locale（仅允许 en / fr），并提供 withLocale 助手 ===
  const seg = pathname?.split('/').filter(Boolean)[0] ?? '';
  const locale = SUPPORTED.has(seg as any) ? (seg as 'en' | 'fr') : 'en';
  const withLocale = (p: string) => (`/${locale}${p}`).replace(/\/{2,}/g, '/');

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const {data: {user}} = await supabase.auth.getUser();
      setUser(user ?? null);
      const {data} = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
      });
      unsub = () => data.subscription.unsubscribe();
    })();
    return () => unsub?.();
  }, [supabase]);

  const isActive = (href: string) => pathname?.startsWith(withLocale(href));

  const logout = async () => {
    await supabase.auth.signOut();
    // 回到当前语言首页
    window.location.href = withLocale('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <nav className="container mx-auto h-16 px-4 flex items-center justify-between">
        {/* 左侧：品牌（悬停浮起 + 发光） */}
        <Link href={withLocale('/')} className="flex items-center gap-3 group" aria-label="Go home">
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl
                       bg-gradient-to-br from-blue-600 to-sky-400 text-white
                       shadow-[0_8px_20px_rgba(56,189,248,.35)]
                       ring-1 ring-white/30 transition-transform duration-200 ease-out
                       group-hover:-translate-y-0.5"
          >
            <Trophy className="h-5 w-5" />
          </span>
          <span
            className="text-2xl font-extrabold tracking-tight
                       bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-600
                       drop-shadow-sm transition-colors duration-200
                       group-hover:from-slate-900 group-hover:to-sky-500"
          >
            HockeyHub
          </span>
        </Link>

        {/* 中间：主导航 */}
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
              <Home className="h-4 w-4" /> Games
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
              <Users className="h-4 w-4" /> Clubs
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
              <MapPin className="h-4 w-4" /> Rinks
            </Link>
          </li>
        </ul>

        {/* 右侧：语言切换 + 登录/用户区 */}
        <div className="flex items-center gap-3">
          {/* 🌐 语言切换（已在组件内处理切换路径） */}
          <LocaleSwitcher />

          {user ? (
            <>
              <Link
                href={withLocale('/notifications')}
                className="hidden sm:inline-flex h-9 items-center gap-2 px-3 rounded-lg
                           text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition"
              >
                <Bell className="h-4 w-4" /> Notifications
              </Link>

              <Link
                href={withLocale('/games/new')}
                className="hidden sm:inline-flex h-9 items-center px-4 rounded-lg text-white
                           bg-gradient-to-r from-blue-600 to-sky-500 hover:to-sky-400
                           shadow hover:shadow-md transition"
              >
                Post Game
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
                    My Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> Logout
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
                Login
              </Link>
              <Link
                href={withLocale('/register')}
                className="h-9 inline-flex items-center px-4 rounded-lg text-white
                           bg-gradient-to-r from-blue-600 to-sky-500 hover:to-sky-400
                           shadow hover:shadow-md transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 顶部细蓝条 */}
      <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />
    </header>
  );
}
