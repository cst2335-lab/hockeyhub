/** Statuses that count toward dashboard "Upcoming Bookings". */
export const ACTIVE_UPCOMING_BOOKING_STATUSES = ['pending', 'confirmed', 'paid'] as const;

export type ActiveUpcomingBookingStatus = (typeof ACTIVE_UPCOMING_BOOKING_STATUSES)[number];

export function isActiveUpcomingBookingStatus(status: string): boolean {
  return (ACTIVE_UPCOMING_BOOKING_STATUSES as readonly string[]).includes(status);
}

/**
 * Count bookings that are still active and on/after today.
 * Cancelled (and other inactive) statuses are excluded.
 */
export function countUpcomingBookings(
  bookings: Array<{ status: string; booking_date: string }>,
  todayIsoDate: string
): number {
  return bookings.filter(
    (b) => isActiveUpcomingBookingStatus(b.status) && b.booking_date >= todayIsoDate
  ).length;
}

export function todayIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
