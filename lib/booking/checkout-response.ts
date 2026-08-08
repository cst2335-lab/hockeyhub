/**
 * Server helpers for create-checkout response shapes.
 * Keeps Stripe secret details off the client when payment is unavailable.
 */

export type DemoPendingBookingResponse = {
  bookingCreated: true;
  paymentAvailable: false;
  bookingId: string;
  status: 'pending';
};

export type StripeCheckoutBookingResponse = {
  url: string;
  bookingId: string;
  paymentAvailable: true;
};

export function buildDemoPendingBookingResponse(bookingId: string): DemoPendingBookingResponse {
  return {
    bookingCreated: true,
    paymentAvailable: false,
    bookingId,
    status: 'pending',
  };
}

export function buildStripeCheckoutBookingResponse(
  url: string,
  bookingId: string
): StripeCheckoutBookingResponse {
  return {
    url,
    bookingId,
    paymentAvailable: true,
  };
}
