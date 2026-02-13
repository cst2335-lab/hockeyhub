// components/layout/footer.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Logo } from '@/components/ui/logo';

export default function Footer() {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const pathname = usePathname();
  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname]);
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
    })();
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <Logo size="sm" showText={true} light={false} />
          <span className="hidden sm:inline text-gray-400">·</span>
          <span>© {new Date().getFullYear()} GoGoHockey</span>
          <span className="hidden md:inline">·</span>
          <Link href="https://vercel.com" className="hover:text-gogo-primary">{tFooter('poweredBy')}</Link>
        </div>

        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          {user && (
            <Link href={withLocale('/dashboard')} className="hover:text-gogo-primary" aria-label={t('dashboard')}>
              {t('dashboard')}
            </Link>
          )}
          <Link href={withLocale('/privacy')} className="hover:text-gogo-primary">{t('privacy')}</Link>
          <Link href={withLocale('/terms')} className="hover:text-gogo-primary">{t('terms')}</Link>
          <Link href={withLocale('/contact')} className="hover:text-gogo-primary">{t('contact')}</Link>
        </nav>
      </div>
    </footer>
  );
}
