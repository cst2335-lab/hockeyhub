// app/[locale]/(dashboard)/book/[rinkId]/page.tsx
'use client';

import {useState, useEffect, useMemo, useCallback} from 'react';
import {createClient} from '@/lib/supabase/client';
import {useRouter, useParams, useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {addHours, format, parse} from 'date-fns';
import {bookingFormSchema} from '@/lib/validations/booking';

export default function BookRinkPage() {
  const t = useTranslations('book');
  const tActions = useTranslations('actions');
  const router = useRouter();
  const { locale, rinkId } = useParams<{ locale: string; rinkId: string }>();

  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [rink, setRink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingBookings, setExistingBookings] = useState<{ start_time: string; end_time: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form fields
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [hours, setHours] = useState<number>(1);

  // locale-aware link helper
  const withLocale = useCallback((p: string) => `/${locale || ''}${p}`.replace('//', '/'), [locale]);

  const fetchRink = useCallback(async () => {
    if (!rinkId) return;
    const { data, error } = await supabase
      .from('rinks')
      .select('*')
      .eq('id', rinkId)
      .single();

    if (error) {
      console.error('Error fetching rink:', error);
      setRink(null);
    } else {
      setRink(data);
    }
    setLoading(false);
  }, [rinkId, supabase]);

  useEffect(() => {
    fetchRink();
  }, [fetchRink]);

  useEffect(() => {
    if (searchParams.get('cancelled') === '1') {
      toast.info('Checkout was cancelled. You can try again when ready.');
    }
  }, [searchParams]);

  // Fetch existing bookings for selected date (exclude cancelled)
  const fetchExistingBookings = useCallback(async () => {
    if (!rinkId || !bookingDate) {
      setExistingBookings([]);
      return;
    }
    setLoadingSlots(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('rink_id', rinkId)
      .eq('booking_date', bookingDate)
      .not('status', 'eq', 'cancelled');

    if (error) {
      console.error('Error fetching bookings:', error);
      setExistingBookings([]);
    } else {
      setExistingBookings((data ?? []).map((b) => ({ start_time: b.start_time || '00:00', end_time: b.end_time || '00:00' })));
    }
    setLoadingSlots(false);
  }, [rinkId, bookingDate, supabase]);

  useEffect(() => {
    fetchExistingBookings();
  }, [fetchExistingBookings]);

  // Check if requested slot overlaps with any existing booking
  const hasSlotConflict = useCallback(
    (reqStart: string, reqEnd: string): boolean => {
      for (const b of existingBookings) {
        // Overlap: reqStart < b.end_time AND b.start_time < reqEnd
        if (reqStart < b.end_time && b.start_time < reqEnd) return true;
      }
      return false;
    },
    [existingBookings]
  );

  const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Calculate end time using date-fns (handles overnight correctly)
  const calcEndTime = (dateStr: string, startTime: string, durHours: number): { endTime: string; endDate: string; isOvernight: boolean } => {
    const start = parse(`${dateStr} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const end = addHours(start, Math.max(1, durHours));
    const isOvernight = format(start, 'yyyy-MM-dd') !== format(end, 'yyyy-MM-dd');
    return {
      endTime: format(end, 'HH:mm'),
      endDate: format(end, 'yyyy-MM-dd'),
      isOvernight,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Localized redirect to login
        router.push(withLocale('/login'));
        setSubmitting(false);
        return;
      }

      const parsed = bookingFormSchema.safeParse({ bookingDate, startTime, hours });
      if (!parsed.success) {
        const msg = parsed.error.errors[0]?.message ?? t('fillRequired');
        toast.error(msg);
        setSubmitting(false);
        return;
      }

      const { endTime, isOvernight } = calcEndTime(bookingDate, startTime, hours);
      if (isOvernight) {
        toast.error(t('spanMidnight'));
        setSubmitting(false);
        return;
      }

      if (hasSlotConflict(startTime, endTime)) {
        toast.error(t('slotBooked'));
        setSubmitting(false);
        return;
      }

      toast.success('Redirecting to payment...');
      const res = await fetch('/api/bookings/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          rinkId,
          bookingDate,
          startTime,
          hours,
          locale: locale || 'en',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? t('checkoutFailed'));
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(t('invalidResponse'));
      setSubmitting(false);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(t('createFailed'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary" />
      </div>
    );
  }

  if (!rink) {
    return (
      <div className="container mx-auto p-8">
        <p>Rink not found</p>
      </div>
    );
  }

  const hourlyRate: number =
    typeof rink.hourly_rate === 'number'
      ? rink.hourly_rate
      : Number(rink.hourly_rate) || 150;

  const subtotal = hourlyRate * hours;
  const platformFee = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + platformFee).toFixed(2);

  // Today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t('title', { name: rink.name })}</h1>

      <div className="bg-surface rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('rinkDetails')}</h2>
        <p className="text-gray-600">{rink.address}</p>
        {rink.phone && <p className="text-gray-600">{rink.phone}</p>}
        <p className="text-lg font-medium mt-2">${hourlyRate}/hour</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('bookingInfo')}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('date')}
            </label>
            <input
              type="date"
              required
              min={today}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('startTime')}
              {loadingSlots && bookingDate && (
                <span className="ml-2 text-xs text-gray-500">({t('checkingAvailability')})</span>
              )}
            </label>
            <select
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-primary"
            >
              <option value="">{t('selectTime')}</option>
              {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map((hour) => {
                const slotStart = `${pad2(hour)}:00`;
                const { endTime: slotEnd, isOvernight } = calcEndTime(bookingDate, slotStart, hours);
                const isOccupied = bookingDate && !isOvernight && hasSlotConflict(slotStart, slotEnd);
                return (
                  <option key={hour} value={slotStart} disabled={!!isOccupied}>
                    {pad2(hour)}:00 {isOccupied ? `(${t('booked')})` : ''}
                  </option>
                );
              })}
            </select>
            {existingBookings.length > 0 && bookingDate && (
              <p className="mt-1 text-xs text-amber-600">
                {t('slotsBookedHint')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('duration')}
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-primary"
            >
              {[1,2,3,4].map((h) => (
                <option key={h} value={h}>
                  {h === 1 ? t('hour', { count: 1 }) : t('hours', { count: h })}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">{t('priceSummary')}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t('iceTime', { hours, rate: hourlyRate })}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('platformFee')}</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>{t('total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-gogo-primary hover:bg-gogo-dark text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gogo-secondary focus:ring-offset-2"
          >
            {submitting ? t('creating') : tActions('confirmBooking')}
          </button>
        </div>
      </form>
    </div>
  );
}
