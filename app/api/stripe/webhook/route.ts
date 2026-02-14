import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { Resend } from 'resend';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) {
    console.error('Webhook: no booking_id in metadata');
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceClient();

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      ...(paymentIntentId && { stripe_payment_intent_id: paymentIntentId }),
    })
    .eq('id', bookingId);

  if (updateError) {
    console.error('Webhook: failed to update booking', updateError);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_date,
      start_time,
      end_time,
      hours,
      total,
      user_id,
      rinks (name)
    `)
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    console.error('Webhook: failed to fetch booking', fetchError);
    return NextResponse.json({ received: true });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', booking.user_id)
    .single();

  const email = profile?.email ?? (session.customer_email as string | null);
  if (email && process.env.RESEND_API_KEY) {
    const rinkName = (booking.rinks as { name?: string } | null)?.name ?? 'Ice Rink';
    const subject = `GoGoHockey – Booking confirmation: ${rinkName}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0E4877;">Booking Confirmation</h2>
        <p>Your payment was successful. Your ice time has been reserved at <strong>${rinkName}</strong>.</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 16px 8px 0; color: #666;">Date</td><td>${booking.booking_date}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; color: #666;">Time</td><td>${booking.start_time} – ${booking.end_time}</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; color: #666;">Duration</td><td>${booking.hours} hour(s)</td></tr>
          <tr><td style="padding: 8px 16px 8px 0; color: #666;">Total</td><td>$${Number(booking.total).toFixed(2)}</td></tr>
        </table>
        <p>Thank you for using GoGoHockey!</p>
      </div>
    `;
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'GoGoHockey <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    });
  }

  return NextResponse.json({ received: true });
}
