// app/[locale]/(dashboard)/bookings/[id]/page.tsx
'use client';

import {useState, useEffect, useCallback} from 'react';
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
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const {locale, id: bookingId} = useParams<{locale: string; id: string}>();

  const fetchBookingDetail = useCallback(async () => {
    if (!bookingId) return;

    const supabase = createClient();

    // Auth check: redirect to localized login if no user
    const {
      data: {user}
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      setLoading(false);
      return;
    }

    // Fetch booking that belongs to the current user
    const {data, error} = await supabase
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
      router.push(`/${locale}/bookings`);
    } else {
      setBooking(data);
    }
    setLoading(false);
  }, [bookingId, locale, router]);

  useEffect(() => {
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  const handleCancel = async () => {
    if (!bookingId) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const supabase = createClient();
    const {error} = await supabase
      .from('bookings')
      .update({status: 'cancelled'})
      .eq('id', bookingId);

    if (error) {
      console.error('Cancel failed:', error);
      return;
    }
    alert('Booking cancelled successfully');
    router.push(`/${locale}/bookings`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-8">
        <p>Booking not found</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800'
  };
  const statusColor = statusColors[booking.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/${locale}/bookings`)}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to My Bookings
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{booking.rinks?.name}</h1>
            <span className={`px-3 py-1 rounded text-sm ${statusColor}`}>{booking.status}</span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(booking.total)}</p>
            <p className="text-sm text-gray-600">Total Amount</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-medium">{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(booking.booking_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">
                  {booking.start_time} - {booking.end_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{booking.hours} hours</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Rink Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{booking.rinks?.address}</p>
              </div>
              {booking.rinks?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{booking.rinks.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Hourly Rate</p>
                <p className="font-medium">{formatCurrency(booking.rinks?.hourly_rate)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Price Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>
                Ice Time ({booking.hours} hours × {formatCurrency(booking.rinks?.hourly_rate)})
              </span>
              <span>{formatCurrency(booking.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (8%)</span>
              <span>{formatCurrency(booking.platform_fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(booking.total)}</span>
            </div>
          </div>
        </div>

        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
            >
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
