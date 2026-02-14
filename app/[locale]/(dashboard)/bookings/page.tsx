// app/[locale]/(dashboard)/bookings/page.tsx
'use client';

import {useCallback, useEffect} from 'react';
import Link from 'next/link';
import {useParams, useRouter, useSearchParams} from 'next/navigation';
import {formatCurrency, formatDateByLocale} from '@/lib/utils/format';
import {useBookings} from '@/lib/hooks';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';

export default function BookingsPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      toast.success('Payment successful! Your booking is confirmed.');
      router.replace(withLocale('/bookings'), { scroll: false });
    }
  }, [searchParams, router, withLocale]);

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
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-surface rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">{t('noBookings')}</p>
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
              className="bg-surface rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-semibold truncate">
                      {b.rinks?.name ?? 'Rink'}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        b.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {b.status === 'pending' ? 'Payment pending' : b.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">
                    📅 {formatDateByLocale(b.booking_date, locale)} — {b.start_time} ~ {b.end_time}
                  </p>
                  <p className="text-gray-600 truncate">{b.rinks?.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm text-gray-600 mb-1">Total</div>
                  <div className="font-bold">{formatCurrency(b.total)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
