// app/[locale]/(dashboard)/bookings/page.tsx
'use client';

import {useCallback, useEffect} from 'react';
import Link from 'next/link';
import {useParams, useRouter} from 'next/navigation';
import {formatCurrency, formatDateByLocale} from '@/lib/utils/format';
import {useBookings} from '@/lib/hooks';
import {useTranslations} from 'next-intl';

export default function BookingsPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const t = useTranslations('bookings');
  const { bookings, isLoading: loading, user } = useBookings();

  const withLocale = useCallback(
    (p: string) => `/${locale || ''}${p}`.replace('//', '/'),
    [locale],
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push(withLocale('/login'));
    }
  }, [loading, user, router, withLocale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card border border-border dark:border-slate-700 rounded-xl shadow-sm p-8 text-center">
          <p className="text-muted-foreground mb-4">{t('noBookings')}</p>
          <Link
            href={withLocale('/rinks')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gogo-primary text-white font-medium hover:bg-gogo-dark transition"
          >
            {t('browseRinksToBook')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={withLocale(`/bookings/${b.id}`)}
              className="bg-card text-card-foreground rounded-xl shadow-md border border-border dark:border-slate-700 p-6 hover:shadow-lg hover:border-gogo-secondary transition-colors block"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-semibold truncate text-foreground">
                      {b.rinks?.name ?? 'Rink'}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        b.status === 'confirmed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {b.status === 'pending' ? 'Payment pending' : b.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    📅 {formatDateByLocale(b.booking_date, locale)} — {b.start_time} ~ {b.end_time}
                  </p>
                  <p className="text-muted-foreground truncate">{b.rinks?.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm text-muted-foreground mb-1">Total</div>
                  <div className="font-bold text-foreground">{formatCurrency(b.total)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
