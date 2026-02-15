'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations('common');
  const seg = pathname?.split('/').filter(Boolean)[0] ?? '';
  const locale = ['en', 'fr'].includes(seg) ? seg : 'en';
  const withLocale = (p: string) => `/${locale}${p}`.replace(/\/{2,}/g, '/');

  useEffect(() => {
    console.error('Dashboard error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('error')}</h1>
        <p className="text-muted-foreground mb-6">{t('errorPageDesc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark transition font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            {t('tryAgain')}
          </button>
          <Link
            href={withLocale('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition font-medium"
          >
            {t('backToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}
