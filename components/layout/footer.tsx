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
    <footer className="border-t border-border bg-muted/30 dark:bg-slate-900/50">
      <Container>
        <div className="py-16">
          <div className="flex justify-center mb-8">
            <Logo size="sm" showText={true} light={false} />
          </div>
          <nav className="text-sm" aria-label="Footer navigation">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground mb-3">{tFooter('clubsAndLeagues')}</span>
                <div className="flex flex-col gap-2">
                  <Link href={withLocale('/clubs')} className="text-muted-foreground hover:text-gogo-primary">{t('clubs')}</Link>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground mb-3">{tFooter('coachesAndParents')}</span>
                <div className="flex flex-col gap-2">
                  {user && (
                    <Link href={withLocale('/dashboard')} className="text-muted-foreground hover:text-gogo-primary">{t('dashboard')}</Link>
                  )}
                  <Link href={withLocale('/register')} className="text-muted-foreground hover:text-gogo-primary">{t('register')}</Link>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground mb-3">{tFooter('sports')}</span>
                <div className="flex flex-col gap-2">
                  <Link href={withLocale('/games')} className="text-muted-foreground hover:text-gogo-primary">{t('games')}</Link>
                  <Link href={withLocale('/rinks')} className="text-muted-foreground hover:text-gogo-primary">{t('rinks')}</Link>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground mb-3">{tFooter('company')}</span>
                <div className="flex flex-col gap-2">
                  <Link href={withLocale('/about')} className="text-muted-foreground hover:text-gogo-primary">{t('about')}</Link>
                  <Link href={withLocale('/contact')} className="text-muted-foreground hover:text-gogo-primary">{t('contact')}</Link>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground mb-3">{tFooter('resources')}</span>
                <div className="flex flex-col gap-2">
                  <Link href={withLocale('/privacy')} className="text-muted-foreground hover:text-gogo-primary">{t('privacy')}</Link>
                  <Link href={withLocale('/terms')} className="text-muted-foreground hover:text-gogo-primary">{t('terms')}</Link>
                  <Link href="#" className="text-muted-foreground hover:text-gogo-primary">{tFooter('help')}</Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-border py-8 sm:flex-row-reverse sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">© {new Date().getFullYear()} GoGoHockey</span>
            <span className="hidden sm:inline text-muted-foreground/60">·</span>
            <Link href="https://vercel.com" className="text-muted-foreground hover:text-gogo-primary">{tFooter('poweredBy')}</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
