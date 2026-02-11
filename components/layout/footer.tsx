// components/layout/footer.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/logo';

export default function Footer() {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const pathname = usePathname();
  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname]);
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <Logo size="sm" showText={true} light={false} />
          <span className="hidden sm:inline text-gray-400">·</span>
          <span>© {new Date().getFullYear()} GoGoHockey</span>
          <span className="hidden md:inline">·</span>
          <Link href="https://vercel.com" className="hover:text-gray-900">{tFooter('poweredBy')}</Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href={withLocale('/privacy')} className="hover:text-gray-900">{t('privacy')}</Link>
          <Link href={withLocale('/terms')} className="hover:text-gray-900">{t('terms')}</Link>
          <Link href={withLocale('/contact')} className="hover:text-gray-900">{t('contact')}</Link>
        </nav>
      </div>
    </footer>
  );
}
