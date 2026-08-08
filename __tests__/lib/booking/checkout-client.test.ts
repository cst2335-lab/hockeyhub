import { describe, expect, it } from 'vitest';
import {
  CHECKOUT_REDIRECT_TOAST,
  DEMO_PENDING_BOOKING_TOAST,
  interpretCheckoutResponse,
  isTechnicalStripeConfigMessage,
} from '@/lib/booking/checkout-client';
import {
  buildDemoPendingBookingResponse,
  buildStripeCheckoutBookingResponse,
} from '@/lib/booking/checkout-response';

describe('checkout response builders', () => {
  it('demo pending response stays pending and hides Stripe config', () => {
    const body = buildDemoPendingBookingResponse('booking-1');
    expect(body).toEqual({
      bookingCreated: true,
      paymentAvailable: false,
      bookingId: 'booking-1',
      status: 'pending',
    });
    expect(JSON.stringify(body).toLowerCase()).not.toContain('stripe_secret');
    expect(body.status).toBe('pending');
  });

  it('Stripe checkout response includes url and paymentAvailable true', () => {
    const body = buildStripeCheckoutBookingResponse('https://checkout.stripe.com/c/pay/cs_test', 'b2');
    expect(body.paymentAvailable).toBe(true);
    expect(body.url).toContain('checkout.stripe.com');
  });
});

describe('interpretCheckoutResponse', () => {
  const fallbackError = 'Checkout failed';
  const invalidResponse = 'Invalid response';

  it('Stripe configured => checkout redirect outcome', () => {
    const outcome = interpretCheckoutResponse({
      ok: true,
      body: buildStripeCheckoutBookingResponse('https://checkout.stripe.com/c/pay/cs_test_123', 'b1'),
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({
      kind: 'checkout',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });
  });

  it('Stripe unavailable => demo_pending, no payment redirect', () => {
    const outcome = interpretCheckoutResponse({
      ok: true,
      body: buildDemoPendingBookingResponse('pending-99'),
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({ kind: 'demo_pending', bookingId: 'pending-99' });
    expect(outcome.kind === 'checkout').toBe(false);
  });

  it('Stripe unavailable path never uses redirect toast copy for demo', () => {
    const outcome = interpretCheckoutResponse({
      ok: true,
      body: buildDemoPendingBookingResponse('pending-1'),
      fallbackError,
      invalidResponse,
    });
    expect(outcome.kind).toBe('demo_pending');
    expect(DEMO_PENDING_BOOKING_TOAST).toContain('Payment is unavailable');
    expect(DEMO_PENDING_BOOKING_TOAST.toLowerCase()).not.toContain('stripe_secret');
    expect(isTechnicalStripeConfigMessage(DEMO_PENDING_BOOKING_TOAST)).toBe(false);
  });

  it('legacy config error body still maps to error (not success)', () => {
    const outcome = interpretCheckoutResponse({
      ok: false,
      body: { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome.kind).toBe('error');
    if (outcome.kind === 'error') {
      expect(isTechnicalStripeConfigMessage(outcome.message)).toBe(true);
    }
  });

  it('failed checkout API => error, no redirect', () => {
    const outcome = interpretCheckoutResponse({
      ok: false,
      body: { error: 'This slot is no longer available' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({
      kind: 'error',
      message: 'This slot is no longer available',
    });
  });

  it('unexpected server error => real error, no false success', () => {
    const outcome = interpretCheckoutResponse({
      ok: false,
      body: { error: 'Failed to create booking' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome.kind).toBe('error');
    expect(outcome.kind === 'demo_pending').toBe(false);
    expect(outcome.kind === 'checkout').toBe(false);
  });

  it('ok response without url or demo fields => invalid response error', () => {
    const outcome = interpretCheckoutResponse({
      ok: true,
      body: { bookingId: 'b1' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({ kind: 'error', message: invalidResponse });
  });

  it('redirect toast is only for checkout kind', () => {
    expect(CHECKOUT_REDIRECT_TOAST).toBe('Redirecting to payment...');
    const demo = interpretCheckoutResponse({
      ok: true,
      body: buildDemoPendingBookingResponse('x'),
      fallbackError,
      invalidResponse,
    });
    expect(demo.kind).not.toBe('checkout');
  });
});

describe('checkout submitting state policy', () => {
  function nextSubmitting(
    outcome: { kind: 'checkout' | 'demo_pending' | 'error' },
    wasSubmitting: boolean
  ): boolean {
    if (outcome.kind === 'checkout') return wasSubmitting; // stay true until hard redirect
    return false; // demo navigates via router; error resets
  }

  it('resets loading state after failure', () => {
    expect(nextSubmitting({ kind: 'error' }, true)).toBe(false);
  });

  it('resets loading after demo pending navigation', () => {
    expect(nextSubmitting({ kind: 'demo_pending' }, true)).toBe(false);
  });

  it('keeps submitting true on Stripe checkout until redirect', () => {
    expect(nextSubmitting({ kind: 'checkout' }, true)).toBe(true);
  });
});
