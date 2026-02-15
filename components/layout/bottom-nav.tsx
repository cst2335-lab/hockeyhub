'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Trophy, Users, LayoutDashboard, User } from 'lucide-react';

const SUPPORTED = new Set(['en', 'fr']);

const items = [
  { path: '/games', labelKey: 'play' as const, icon: Trophy },
  { path: '/clubs', labelKey: 'community' as const, icon: Users },
  { path: '/dashboard', labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { path: '/profile', labelKey: 'profile' as const, icon: User },
] as const;

/**
 * Mobile-only bottom navigation: Play, Community, Dashboard, Profile.
 * Fixed at bottom; only visible below lg breakpoint (lg:hidden).
 */
export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const seg = pathname?.split('/').filter(Boolean)[0] ?? '';
  const locale = SUPPORTED.has(seg) ? seg : 'en';
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-4 h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const href = withLocale(item.path);
          const active =
            pathname === href || (pathname?.startsWith(href + '/') ?? false);
          return (
            <Link
              key={item.path}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition ${
                active
                  ? 'text-gogo-primary bg-gogo-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
