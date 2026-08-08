/**
 * Client-side interpretation of POST /api/bookings/create-checkout responses.
 * Keeps success/redirect UX gated on a valid checkout URL.
 */

export type CheckoutResponseBody = {
  url?: unknown;
  error?: unknown;
  bookingId?: unknown;
  errorCode?: unknown;
};

export type CheckoutFlowOutcome =
  | { kind: 'success'; url: string }
  | { kind: 'error'; message: string };

/**
 * Map fetch result → UI outcome.
 * Success only when HTTP ok and `url` is a non-empty string.
 */
export function interpretCheckoutResponse(params: {
  ok: boolean;
  body: CheckoutResponseBody;
  fallbackError: string;
  invalidResponse: string;
}): CheckoutFlowOutcome {
  const { ok, body, fallbackError, invalidResponse } = params;

  if (!ok) {
    const msg = typeof body.error === 'string' && body.error.trim() ? body.error.trim() : fallbackError;
    return { kind: 'error', message: msg };
  }

  if (typeof body.url === 'string' && body.url.trim()) {
    return { kind: 'success', url: body.url.trim() };
  }

  return { kind: 'error', message: invalidResponse };
}

export const CHECKOUT_REDIRECT_TOAST = 'Redirecting to payment...';
