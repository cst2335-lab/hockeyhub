'use client';

/**
 * Checkout component with graceful fallback.
 * - If a real Stripe publishable key exists -> render real card form and charge.
 * - If key is missing or 'dummy' -> render a clickable placeholder button (no Stripe).
 */

import { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Read publishable key at build time
const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// Consider anything with "dummy" as not configured
const isDummy = !pk || /dummy/i.test(pk);

// Only call loadStripe when we have a real key
const stripePromise = !isDummy ? loadStripe(pk!) : Promise.resolve(null);

function RealCheckout({ bookingId, amountCents }: { bookingId: string; amountCents: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Debug info in dev tools
  useEffect(() => {
    console.log('[Checkout] hasPublishableKey:', Boolean(pk));
    console.log('[Checkout] stripe loaded:', Boolean(stripe));
  }, [stripe]);

  const pay = async () => {
    setErr(null);
    if (!stripe || !elements) {
      setErr('Stripe failed to load. Check your publishable key.');
      return;
    }
    setLoading(true);
    try {
      // 1) Ask backend to create a PaymentIntent
      const r = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const { clientSecret, error } = await r.json();
      if (error || !clientSecret) throw new Error(error ?? 'No clientSecret');

      // 2) Confirm the card payment
      const res = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });
      if (res.error) throw new Error(res.error.message || 'Payment failed');

      // 3) On success, redirect
      if (res.paymentIntent?.status === 'succeeded') {
        window.location.href = `/bookings/success?booking_id=${bookingId}`;
      }
    } catch (e: any) {
      setErr(e.message || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 border rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        onClick={pay}
        disabled={loading || !stripe}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        aria-label="Pay now"
      >
        {loading ? 'Processing...' : `Pay $${(amountCents / 100).toFixed(2)}`}
      </button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </div>
  );
}

function DummyCheckout({ amountCents }: { amountCents: number }) {
  const onClick = () => {
    // Pure placeholder flow – no Stripe calls, no backend required.
    alert('Stripe is not configured yet. This is a demo checkout button.');
  };

  return (
    <div className="space-y-3">
      <div className="p-3 border rounded text-sm text-gray-600">
        [Payment form placeholder] — Stripe not configured.
      </div>
      <button
        onClick={onClick}
        className="px-4 py-2 rounded bg-gray-500 text-white"
        aria-label="Demo pay (no-op)"
      >
        Pay ${ (amountCents / 100).toFixed(2) }
      </button>
    </div>
  );
}

export default function Checkout(props: { bookingId: string; amountCents: number }) {
  // If not configured (or using dummy), show a safe, clickable placeholder
  if (isDummy) {
    return <DummyCheckout amountCents={props.amountCents} />;
  }

  // Otherwise render the real Stripe Elements flow
  const options = useMemo(() => ({}), []);
  return (
    <Elements stripe={stripePromise as any} options={options}>
      <RealCheckout {...props} />
    </Elements>
  );
}
