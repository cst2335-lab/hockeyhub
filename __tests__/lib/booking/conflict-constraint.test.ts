import { describe, expect, it } from 'vitest';
import {
  BOOKING_OVERLAP_CONSTRAINT,
  isBookingOverlapConstraintError,
} from '@/lib/booking/conflict-constraint';

describe('isBookingOverlapConstraintError', () => {
  it('returns true for exclusion constraint SQLSTATE', () => {
    expect(isBookingOverlapConstraintError({ code: '23P01' })).toBe(true);
  });

  it('returns true when constraint name is present', () => {
    expect(
      isBookingOverlapConstraintError({
        code: 'XX000',
        constraint: BOOKING_OVERLAP_CONSTRAINT,
        message: 'conflicting key value violates exclusion constraint',
      })
    ).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isBookingOverlapConstraintError({ code: '23505', message: 'duplicate key' })).toBe(false);
    expect(isBookingOverlapConstraintError(undefined)).toBe(false);
  });
});
