export const BOOKING_OVERLAP_CONSTRAINT = 'no_overlapping_bookings';

type PostgrestErrorLike = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  constraint?: string | null;
} | null | undefined;

export function isBookingOverlapConstraintError(error: PostgrestErrorLike): boolean {
  if (!error) return false;
  if (error.code === '23P01') return true; // exclusion constraint violation

  const haystack = [error.constraint, error.message, error.details]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    haystack.includes(BOOKING_OVERLAP_CONSTRAINT) ||
    haystack.includes('exclusion constraint')
  );
}
