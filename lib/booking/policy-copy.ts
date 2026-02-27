import { CANCELLATION_POLICY } from '@/lib/booking/policies';

export function getCancellationPolicyText(): string {
  return `Refund policy: full refund if cancelled ${CANCELLATION_POLICY.fullRefundHours}+ hours before start, ${Math.round(
    CANCELLATION_POLICY.partialRefundRate * 100
  )}% refund if cancelled ${CANCELLATION_POLICY.partialRefundHours}–${CANCELLATION_POLICY.fullRefundHours} hours before start, no refund after that window.`;
}

export function getCancellationPolicyHtml(): string {
  const partialPct = Math.round(CANCELLATION_POLICY.partialRefundRate * 100);
  return `
    <div style="margin-top: 16px; padding: 12px; background: #f4f8fb; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #0E4877; font-weight: 600;">Cancellation policy</p>
      <ul style="margin: 0; padding-left: 18px; color: #333;">
        <li>Full refund if cancelled ${CANCELLATION_POLICY.fullRefundHours}+ hours before start</li>
        <li>${partialPct}% refund if cancelled ${CANCELLATION_POLICY.partialRefundHours}–${CANCELLATION_POLICY.fullRefundHours} hours before start</li>
        <li>No refund if cancelled less than ${CANCELLATION_POLICY.partialRefundHours} hours before start</li>
      </ul>
    </div>
  `;
}

