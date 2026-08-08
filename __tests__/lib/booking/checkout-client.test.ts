import { describe, expect, it } from 'vitest';
import {
  CHECKOUT_REDIRECT_TOAST,
  interpretCheckoutResponse,
} from '@/lib/booking/checkout-client';

describe('interpretCheckoutResponse', () => {
  const fallbackError = 'Checkout failed';
  const invalidResponse = 'Invalid response';

  it('Stripe not configured (503) => error only, no success', () => {
    const outcome = interpretCheckoutResponse({
      ok: false,
      body: { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({
      kind: 'error',
      message: 'Stripe is not configured. Set STRIPE_SECRET_KEY.',
    });
    expect(outcome.kind === 'success').toBe(false);
  });

  it('failed checkout API => error message from body, no redirect url', () => {
    const outcome = interpretCheckoutResponse({
      ok: false,
      body: { error: 'This slot is no longer available' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome.kind).toBe('error');
    if (outcome.kind === 'error') {
      expect(outcome.message).toBe('This slot is no longer available');
    }
  });

  it('failed checkout with empty body => fallback error', () => {
    const outcome = interpretCheckoutResponse({
      ok: false,
      body: {},
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({ kind: 'error', message: fallbackError });
  });

  it('successful checkout => url for redirect toast + redirect', () => {
    const outcome = interpretCheckoutResponse({
      ok: true,
      body: { url: 'https://checkout.stripe.com/c/pay/cs_test_123', bookingId: 'b1' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({
      kind: 'success',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });
  });

  it('ok response without url => invalid response error', () => {
    const outcome = interpretCheckoutResponse({
      ok: true,
      body: { bookingId: 'b1' },
      fallbackError,
      invalidResponse,
    });
    expect(outcome).toEqual({ kind: 'error', message: invalidResponse });
  });

  it('redirect toast copy is only for success path consumers', () => {
    expect(CHECKOUT_REDIRECT_TOAST).toBe('Redirecting to payment...');
    const fail = interpretCheckoutResponse({
      ok: false,
      body: { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
      fallbackError,
      invalidResponse,
    });
    // Callers must not show CHECKOUT_REDIRECT_TOAST when kind !== 'success'
    expect(fail.kind).not.toBe('success');
  });
});

/**
 * Mirrors booking page control flow for submitting flag:
 * success → leave submitting (navigate away); error → reset.
 */
describe('checkout submitting state policy', () => {
  function nextSubmitting(outcome: { kind: 'success' | 'error' }, wasSubmitting: boolean): boolean {
    if (outcome.kind === 'success') return wasSubmitting; // stay true until navigation
    return false;
  }

  it('resets loading state after failure', () => {
    expect(nextSubmitting({ kind: 'error' }, true)).toBe(false);
  });

  it('keeps submitting true on success until redirect', () => {
    expect(nextSubmitting({ kind: 'success' }, true)).toBe(true);
  });
});
