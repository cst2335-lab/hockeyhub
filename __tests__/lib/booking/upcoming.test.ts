import { describe, expect, it } from 'vitest';
import {
  countUpcomingBookings,
  isActiveUpcomingBookingStatus,
  todayIsoDate,
} from '@/lib/booking/upcoming';

describe('isActiveUpcomingBookingStatus', () => {
  it('accepts pending, confirmed, and paid', () => {
    expect(isActiveUpcomingBookingStatus('pending')).toBe(true);
    expect(isActiveUpcomingBookingStatus('confirmed')).toBe(true);
    expect(isActiveUpcomingBookingStatus('paid')).toBe(true);
  });

  it('rejects cancelled and completed', () => {
    expect(isActiveUpcomingBookingStatus('cancelled')).toBe(false);
    expect(isActiveUpcomingBookingStatus('completed')).toBe(false);
  });
});

describe('countUpcomingBookings', () => {
  const today = '2026-08-08';

  it('excludes cancelled bookings from upcoming count', () => {
    const count = countUpcomingBookings(
      [
        { status: 'cancelled', booking_date: '2026-08-10' },
        { status: 'pending', booking_date: '2026-08-12' },
      ],
      today
    );
    expect(count).toBe(1);
  });

  it('counts pending future bookings', () => {
    expect(
      countUpcomingBookings([{ status: 'pending', booking_date: '2026-08-09' }], today)
    ).toBe(1);
  });

  it('counts confirmed and paid future bookings', () => {
    expect(
      countUpcomingBookings(
        [
          { status: 'confirmed', booking_date: '2026-08-15' },
          { status: 'paid', booking_date: '2026-08-20' },
        ],
        today
      )
    ).toBe(2);
  });

  it('does not count past bookings as upcoming', () => {
    expect(
      countUpcomingBookings(
        [
          { status: 'confirmed', booking_date: '2026-08-01' },
          { status: 'pending', booking_date: '2026-07-01' },
        ],
        today
      )
    ).toBe(0);
  });

  it('counts bookings on today', () => {
    expect(
      countUpcomingBookings([{ status: 'confirmed', booking_date: today }], today)
    ).toBe(1);
  });
});

describe('todayIsoDate', () => {
  it('returns local calendar YYYY-MM-DD', () => {
    const d = new Date(2026, 7, 8, 15, 30, 0); // Aug 8 local
    expect(todayIsoDate(d)).toBe('2026-08-08');
  });
});
