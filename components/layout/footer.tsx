// components/layout/footer.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Logo } from '@/components/ui/logo';
import { Container } from '@/components/ui/container';

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
    <footer className="border-t bg-background">
      <Container>
        <div className="py-16">
          <div className="flex justify-center">
            <Logo size="sm" showText={true} light={false} />
          </div>
          <nav className="mt-10 text-sm" aria-label="Footer navigation">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {user && (
                <Link href={withLocale('/dashboard')} className="hover:text-gogo-primary" aria-label={t('dashboard')}>
                  {t('dashboard')}
                </Link>
              )}
              <Link href={withLocale('/privacy')} className="hover:text-gogo-primary">{t('privacy')}</Link>
              <Link href={withLocale('/terms')} className="hover:text-gogo-primary">{t('terms')}</Link>
              <Link href={withLocale('/contact')} className="hover:text-gogo-primary">{t('contact')}</Link>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-slate-400/10 py-10 sm:flex-row-reverse sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">© {new Date().getFullYear()} GoGoHockey</span>
            <span className="hidden sm:inline text-slate-400">·</span>
            <Link href="https://vercel.com" className="text-slate-500 hover:text-gogo-primary">{tFooter('poweredBy')}</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
