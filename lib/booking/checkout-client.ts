/**
 * Client-side interpretation of POST /api/bookings/create-checkout responses.
 */

export type CheckoutResponseBody = {
  url?: unknown;
  error?: unknown;
  bookingId?: unknown;
  errorCode?: unknown;
  bookingCreated?: unknown;
  paymentAvailable?: unknown;
  status?: unknown;
};

export type CheckoutFlowOutcome =
  | { kind: 'checkout'; url: string }
  | { kind: 'demo_pending'; bookingId: string }
  | { kind: 'error'; message: string };

export const CHECKOUT_REDIRECT_TOAST = 'Redirecting to payment...';
export const DEMO_PENDING_BOOKING_TOAST =
  'Booking created. Payment is unavailable in this local demo.';

/**
 * Map fetch result → UI outcome.
 * - Stripe checkout: HTTP ok + checkout `url`
 * - Local demo (no Stripe): HTTP ok + bookingCreated + paymentAvailable:false + bookingId
 * - Errors: non-ok or invalid body (never surface raw secret-config strings as the happy path)
 */
export function interpretCheckoutResponse(params: {
  ok: boolean;
  body: CheckoutResponseBody;
  fallbackError: string;
  invalidResponse: string;
}): CheckoutFlowOutcome {
  const { ok, body, fallbackError, invalidResponse } = params;

  if (!ok) {
    const msg =
      typeof body.error === 'string' && body.error.trim() ? body.error.trim() : fallbackError;
    // Never treat missing-Stripe config text as a silent success path
    return { kind: 'error', message: msg };
  }

  const bookingId =
    typeof body.bookingId === 'string' && body.bookingId.trim() ? body.bookingId.trim() : '';

  // Graceful demo: pending booking saved, payment not available
  if (body.bookingCreated === true && body.paymentAvailable === false && bookingId) {
    return { kind: 'demo_pending', bookingId };
  }

  if (typeof body.url === 'string' && body.url.trim()) {
    return { kind: 'checkout', url: body.url.trim() };
  }

  return { kind: 'error', message: invalidResponse };
}

/** End-user messages must not include secret-key / config instructions. */
export function isTechnicalStripeConfigMessage(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('stripe_secret_key') || m.includes('stripe is not configured');
}
