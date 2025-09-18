// app/api/payments/create-intent/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
// If you use Supabase to look up booking total, import your server client here.
// import { createClient } from '@/lib/supabase/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Create the Stripe SDK instance (server-side only)
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
      // Always return JSON even on errors
      return NextResponse.json(
        { error: 'Missing STRIPE_SECRET_KEY on server' },
        { status: 500 }
      );
    }

    // Expecting JSON from client: { bookingId } or { bookingId, amountCents }
    const body = await req.json().catch(() => ({}));
    const { bookingId, amountCents } = body ?? {};

    // 1) Compute amount on server
    //    For demo we accept amountCents from client if provided,
    //    but in production you should look up the booking by ID and compute total here.
    //    Example (pseudo):
    // const supabase = createClient();
    // const { data: booking } = await supabase
    //   .from('bookings')
    //   .select('total, currency')
    //   .eq('id', bookingId)
    //   .single();
    // const amount = Math.round((booking?.total ?? 0) * 100);
    // const currency = booking?.currency ?? 'usd';

    const amount = typeof amountCents === 'number' ? amountCents : 5000; // $50.00 as fallback
    const currency = 'usd'; // or 'cad' if you charge in CAD

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // 2) Create PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId: bookingId ?? '' },
    });

    // 3) Return clientSecret as JSON
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err: any) {
    console.error('[create-intent] error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
