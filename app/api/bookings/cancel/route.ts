import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;

/** Cancel a confirmed booking. Refund: full if within 48h of booking start, else 90% (10% fee). */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const user = auth.user!;

  let body: { bookingId: string };
  try {
    body = (await request.json()) as { bookingId: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { bookingId } = body;
  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, user_id, status, total, stripe_payment_intent_id, booking_date, start_time')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
  }
  if (booking.status !== 'confirmed' && booking.status !== 'pending') {
    return NextResponse.json({ error: 'Booking cannot be cancelled' }, { status: 400 });
  }

  const paymentIntentId = (booking as { stripe_payment_intent_id?: string | null }).stripe_payment_intent_id;
  if (stripe && paymentIntentId && booking.status === 'confirmed') {
    const bookingStart = new Date(`${booking.booking_date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilStart = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    const fullRefund = hoursUntilStart >= 48;
    const totalCents = Math.round(Number(booking.total) * 100);
    const refundAmountCents = fullRefund ? totalCents : Math.round(totalCents * 0.9);

    try {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmountCents,
        reason: 'requested_by_customer',
      });
    } catch (err) {
      console.error('Stripe refund error:', err);
      return NextResponse.json(
        { error: 'Refund failed. Please contact support.' },
        { status: 502 }
      );
    }
  }

  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Booking cancelled' });
}
