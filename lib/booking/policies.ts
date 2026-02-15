/**
 * Booking cancellation and refund policy.
 * Used by API cancel flow and (future) admin refunds.
 */

/** Hours before booking start: full refund if >= this. */
export const CANCELLATION_POLICY = {
  fullRefundHours: 24,
  /** Hours before start: partial refund (e.g. 50%) if >= this and < fullRefundHours. */
  partialRefundHours: 12,
  /** Refund fraction when in partial window (0–1). */
  partialRefundRate: 0.5,
  /** Hours before start: no refund if < this. */
  noRefundHours: 0,
} as const;

export type RefundOutcome = 'full' | 'partial' | 'none';

/**
 * Returns refund type and multiplier (0–1) based on hours until booking start.
 */
export function getRefundPolicy(hoursUntilStart: number): {
  outcome: RefundOutcome;
  rate: number;
} {
  if (hoursUntilStart >= CANCELLATION_POLICY.fullRefundHours) {
    return { outcome: 'full', rate: 1 };
  }
  if (hoursUntilStart >= CANCELLATION_POLICY.partialRefundHours) {
    return {
      outcome: 'partial',
      rate: CANCELLATION_POLICY.partialRefundRate,
    };
  }
  return { outcome: 'none', rate: 0 };
}

/**
 * Compute refund amount in cents. Returns 0 if no refund.
 */
export function getRefundAmountCents(
  totalCents: number,
  hoursUntilStart: number
): number {
  const { rate } = getRefundPolicy(hoursUntilStart);
  return Math.round(totalCents * rate);
}
