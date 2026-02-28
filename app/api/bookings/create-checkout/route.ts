import { NextRequest, NextResponse } from 'next/server';
import { addHours, format, parse } from 'date-fns';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { bookingCheckoutSchema } from '@/lib/validations/booking';
import { isBookingOverlapConstraintError } from '@/lib/booking/conflict-constraint';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;
const SLOT_UNAVAILABLE_MESSAGE = 'This slot is no longer available';

function calcEndTime(
  dateStr: string,
  startTime: string,
  durHours: number
): { endTime: string; endDate: string; isOvernight: boolean } {
  const start = parse(`${dateStr} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const end = addHours(start, Math.max(1, durHours));
  const isOvernight = format(start, 'yyyy-MM-dd') !== format(end, 'yyyy-MM-dd');
  return {
    endTime: format(end, 'HH:mm'),
    endDate: format(end, 'yyyy-MM-dd'),
    isOvernight,
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const user = auth.user!;
  if (!user.email) {
    return NextResponse.json({ error: 'User email required for checkout' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', errorCode: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const parsed = bookingCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.errors[0]?.message ?? 'Invalid booking data',
        errorCode: 'INVALID_BOOKING_PAYLOAD',
      },
      { status: 400 }
    );
  }

  const { rinkId, bookingDate, startTime, hours, locale } = parsed.data;
  const { endTime, isOvernight } = calcEndTime(bookingDate, startTime, hours);
  if (isOvernight) {
    return NextResponse.json(
      { error: 'Bookings cannot span midnight' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: rink, error: rinkError } = await supabase
    .from('rinks')
    .select('id, name, hourly_rate')
    .eq('id', rinkId)
    .single();

  if (rinkError || !rink) {
    return NextResponse.json({ error: 'Rink not found' }, { status: 404 });
  }

  const hourlyRate =
    typeof rink.hourly_rate === 'number'
      ? rink.hourly_rate
      : Number(rink.hourly_rate) || 150;
  const subtotal = hourlyRate * hours;
  const platformFee = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + platformFee).toFixed(2);
  const totalCents = Math.round(total * 100);

  const { data: existing } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('rink_id', rinkId)
    .eq('booking_date', bookingDate)
    .not('status', 'eq', 'cancelled');

  const hasConflict = (existing ?? []).some(
    (b) => startTime < (b.end_time || '00:00') && (b.start_time || '00:00') < endTime
  );
  if (hasConflict) {
    return NextResponse.json(
      { error: SLOT_UNAVAILABLE_MESSAGE },
      { status: 409 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
      { status: 503 }
    );
  }

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      rink_id: rinkId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      hours,
      subtotal,
      platform_fee: platformFee,
      total,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !booking) {
    if (isBookingOverlapConstraintError(insertError)) {
      return NextResponse.json(
        { error: SLOT_UNAVAILABLE_MESSAGE },
        { status: 409 }
      );
    }

    console.error('Booking insert error:', insertError);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';
  const protocol = baseUrl.startsWith('http') ? '' : 'https://';
  const origin = `${protocol}${baseUrl}`.replace(/\/$/, '');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'cad',
          product_data: {
            name: `Ice time at ${rink.name}`,
            description: `${bookingDate} ${startTime}–${endTime}, ${hours} hr(s)`,
          },
          unit_amount: totalCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/${locale}/dashboard?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    cancel_url: `${origin}/${locale}/book/${rinkId}?cancelled=1`,
    metadata: {
      booking_id: booking.id,
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url, bookingId: booking.id });
}
