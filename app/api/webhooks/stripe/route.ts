import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { claimStripeWebhookEvent } from '@/lib/stripe/webhook-idempotency';
import { Resend } from 'resend';
import { getCancellationPolicyHtml } from '@/lib/booking/policy-copy';
import { escapeHtml, sanitizePlainText } from '@/lib/utils/sanitize';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' }) : null;

/**
 * Stripe Webhook: verify signature, handle checkout.session.completed and payment_intent.payment_failed.
 * Set STRIPE_WEBHOOK_SECRET (whsec_...) in env. Bookings table must have stripe_payment_intent_id column.
 */
export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe or webhook secret not configured' },
      { status: 501 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature' }, { status: 400 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    const claim = await claimStripeWebhookEvent(supabase, event.id);
    if (claim === 'duplicate') {
      return NextResponse.json({ received: true, deduplicated: true });
    }
  } catch (err) {
    console.error('Stripe webhook: failed to persist event id', event.id, err);
    return NextResponse.json(
      { error: 'Failed to persist webhook event id' },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

        if (!bookingId) {
          console.warn('Stripe webhook: checkout.session.completed missing metadata.booking_id');
          break;
        }

        const { error } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            ...(paymentIntentId && { stripe_payment_intent_id: paymentIntentId }),
          })
          .eq('id', bookingId);

        if (error) {
          console.error('Stripe webhook: failed to update booking', bookingId, error);
          return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
          );
        }

        const { data: booking } = await supabase
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

        if (booking) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', booking.user_id)
            .single();

          const email = profile?.email ?? (session.customer_email as string | null);
          if (email && process.env.RESEND_API_KEY) {
            const rinkNameRaw = (booking.rinks as { name?: string } | null)?.name ?? 'Ice Rink';
            const rinkNameText = sanitizePlainText(rinkNameRaw) || 'Ice Rink';
            const rinkNameHtml = escapeHtml(rinkNameRaw);
            const bookingDateHtml = escapeHtml(String(booking.booking_date ?? ''));
            const startTimeHtml = escapeHtml(String(booking.start_time ?? ''));
            const endTimeHtml = escapeHtml(String(booking.end_time ?? ''));
            const subject = `GoGoHockey – Booking confirmation: ${rinkNameText}`;
            const policyHtml = getCancellationPolicyHtml();
            const html = `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #0E4877;">Booking Confirmation</h2>
                <p>Your payment was successful. Your ice time has been reserved at <strong>${rinkNameHtml}</strong>.</p>
                <table style="border-collapse: collapse; margin: 16px 0;">
                  <tr><td style="padding: 8px 16px 8px 0; color: #666;">Date</td><td>${bookingDateHtml}</td></tr>
                  <tr><td style="padding: 8px 16px 8px 0; color: #666;">Time</td><td>${startTimeHtml} – ${endTimeHtml}</td></tr>
                  <tr><td style="padding: 8px 16px 8px 0; color: #666;">Duration</td><td>${booking.hours} hour(s)</td></tr>
                  <tr><td style="padding: 8px 16px 8px 0; color: #666;">Total</td><td>$${Number(booking.total).toFixed(2)}</td></tr>
                </table>
                ${policyHtml}
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
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn('Stripe payment_intent.payment_failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
