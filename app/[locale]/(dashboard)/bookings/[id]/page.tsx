// app/[locale]/(dashboard)/bookings/[id]/page.tsx
'use client';

import {useState, useEffect, useCallback, useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {createClient} from '@/lib/supabase/client';
import {useRouter, useParams} from 'next/navigation';
import {formatCurrency, formatDate} from '@/lib/utils/format';

/**
 * Booking detail page
 * - Read params via useParams() to get locale and id.
 * - Require auth: unauthenticated users are redirected to /{locale}/login.
 * - Only allow the owner to read the booking (filter by user_id).
 * - Wrap data loader with useCallback to satisfy exhaustive-deps.
 */
export default function BookingDetailPage() {
  const t = useTranslations('bookings');
  const router = useRouter();
  const { locale, id: bookingId } = useParams<{ locale: string; id: string }>();

  const supabase = useMemo(() => createClient(), []);
  const withLocale = useCallback(
    (p: string) => `/${locale || ''}${p}`.replace('//', '/'),
    [locale]
  );

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingDetail = useCallback(async () => {
    if (!bookingId) return;

    // Auth check: redirect to localized login if no user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(withLocale('/login'));
      setLoading(false);
      return;
    }

    // Fetch booking that belongs to the current user
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
          *,
          rinks (name, address, phone, hourly_rate)
        `
      )
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching booking:', error);
      router.push(withLocale('/dashboard'));
    } else {
      setBooking(data);
    }
    setLoading(false);
  }, [bookingId, router, supabase, withLocale]);

  useEffect(() => {
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!bookingId) return;
    if (!confirm(t('cancelConfirm'))) return;

    setCancelling(true);
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? t('cancelError'));
        setCancelling(false);
        return;
      }
      toast.success(t('cancelSuccess'));
      router.push(withLocale('/dashboard'));
    } catch {
      toast.error(t('cancelError'));
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-muted-foreground">{t('notFound')}</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    completed: 'bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300',
  };
  const statusColor = statusColors[booking.status] || 'bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300';

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(withLocale('/dashboard'))}
          className="text-muted-foreground hover:text-foreground transition"
        >
          {t('backToDashboard')}
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">{booking.rinks?.name}</h1>
            <span className={`px-3 py-1 rounded text-sm ${statusColor}`}>{booking.status}</span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gogo-primary">
              {formatCurrency(booking.total)}
            </p>
            <p className="text-sm text-muted-foreground">{t('totalAmount')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">{t('bookingDetails')}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('bookingId')}</p>
                <p className="font-medium text-foreground">{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('date')}</p>
                <p className="font-medium text-foreground">{formatDate(booking.booking_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('time')}</p>
                <p className="font-medium text-foreground">
                  {booking.start_time} - {booking.end_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('duration')}</p>
                <p className="font-medium text-foreground">{booking.hours} hours</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">{t('rinkInfo')}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('location')}</p>
                <p className="font-medium text-foreground">{booking.rinks?.address}</p>
              </div>
              {booking.rinks?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('phone')}</p>
                  <p className="font-medium text-foreground">{booking.rinks.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{t('hourlyRate')}</p>
                <p className="font-medium text-foreground">{formatCurrency(booking.rinks?.hourly_rate)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-4 text-foreground">{t('priceBreakdown')}</h2>
          <div className="space-y-2 text-foreground">
            <div className="flex justify-between">
              <span>
                {t('iceTimeLabel', { hours: booking.hours, rate: formatCurrency(booking.rinks?.hourly_rate) })}
              </span>
              <span>{formatCurrency(booking.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('platformFee')}</span>
              <span>{formatCurrency(booking.platform_fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>{t('total')}</span>
              <span>{formatCurrency(booking.total)}</span>
            </div>
          </div>
        </div>

        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-6 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {cancelling ? t('cancelling') : t('cancelBooking')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
