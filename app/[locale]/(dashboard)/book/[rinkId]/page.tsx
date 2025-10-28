// app/[locale]/(dashboard)/book/[rinkId]/page.tsx
'use client';

import {useState, useEffect, useMemo, useCallback} from 'react';
import {createClient} from '@/lib/supabase/client';
import {useRouter, useParams} from 'next/navigation';

export default function BookRinkPage() {
  const router = useRouter();
  // Read locale and rinkId from URL params (client-side)
  const { locale, rinkId } = useParams<{ locale: string; rinkId: string }>();

  const supabase = useMemo(() => createClient(), []);

  const [rink, setRink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  // pad hour/minute to HH:mm
  const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const calcEndTime = (start: string, durHours: number) => {
    // start expected "HH:mm"
    const [hStr = '0', mStr = '00'] = start.split(':');
    const h = Math.max(0, Math.min(23, parseInt(hStr, 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt(mStr, 10) || 0));
    // simple wraparound by 24h
    const endH = (h + Math.max(1, durHours)) % 24;
    return `${pad2(endH)}:${pad2(m)}`;
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

      if (!bookingDate || !startTime || !hours) {
        alert('Please fill date, start time and duration.');
        setSubmitting(false);
        return;
      }

      const hourlyRate: number =
        typeof rink?.hourly_rate === 'number'
          ? rink.hourly_rate
          : Number(rink?.hourly_rate) || 150;

      const subtotal = hourlyRate * hours;
      const platformFee = +(subtotal * 0.08).toFixed(2);
      const total = +(subtotal + platformFee).toFixed(2);
      const endTime = calcEndTime(startTime, hours);

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        rink_id: rinkId,
        booking_date: bookingDate, // yyyy-mm-dd
        start_time: startTime,     // HH:mm
        end_time: endTime,         // HH:mm
        hours,
        subtotal,
        platform_fee: platformFee,
        total,
        status: 'pending',
      });

      if (error) throw error;

      alert('Booking created successfully! Redirecting to your bookings...');
      // Localized redirect to bookings
      router.push(withLocale('/bookings'));
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to create booking. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
      <h1 className="text-3xl font-bold mb-6">Book {rink.name}</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Rink Details</h2>
        <p className="text-gray-600">{rink.address}</p>
        {rink.phone && <p className="text-gray-600">{rink.phone}</p>}
        <p className="text-lg font-medium mt-2">${hourlyRate}/hour</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Booking Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              min={today}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <select
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select time</option>
              {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].map((hour) => (
                <option key={hour} value={`${pad2(hour)}:00`}>
                  {pad2(hour)}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {[1,2,3,4].map((h) => (
                <option key={h} value={h}>
                  {h} hour{h > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Price Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Ice Time ({hours} hours × ${hourlyRate})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (8%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
