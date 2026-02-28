import { describe, it, expect } from 'vitest';
import {
  bookingFormSchema,
  bookingCheckoutSchema,
  cancelBookingSchema,
  sendBookingConfirmationSchema,
} from '@/lib/validations/booking';

describe('bookingFormSchema', () => {
  it('accepts valid input', () => {
    const result = bookingFormSchema.safeParse({
      bookingDate: '2025-03-01',
      startTime: '10:00',
      hours: 2,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty bookingDate', () => {
    const result = bookingFormSchema.safeParse({
      bookingDate: '',
      startTime: '10:00',
      hours: 2,
    });
    expect(result.success).toBe(false);
  });

  it('rejects hours < 1', () => {
    const result = bookingFormSchema.safeParse({
      bookingDate: '2025-03-01',
      startTime: '10:00',
      hours: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects hours > 12', () => {
    const result = bookingFormSchema.safeParse({
      bookingDate: '2025-03-01',
      startTime: '10:00',
      hours: 13,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid time format', () => {
    const result = bookingFormSchema.safeParse({
      bookingDate: '2025-03-01',
      startTime: '25:99',
      hours: 2,
    });
    expect(result.success).toBe(false);
  });
});

describe('bookingCheckoutSchema', () => {
  it('accepts valid checkout payload', () => {
    const result = bookingCheckoutSchema.safeParse({
      rinkId: '11111111-2222-3333-4444-555555555555',
      bookingDate: '2025-03-01',
      startTime: '10:00',
      hours: 2,
      locale: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid rink id', () => {
    const result = bookingCheckoutSchema.safeParse({
      rinkId: 'rink-123',
      bookingDate: '2025-03-01',
      startTime: '10:00',
      hours: 2,
      locale: 'en',
    });
    expect(result.success).toBe(false);
  });
});

describe('cancelBookingSchema', () => {
  it('rejects invalid booking id', () => {
    const result = cancelBookingSchema.safeParse({ bookingId: 'abc' });
    expect(result.success).toBe(false);
  });
});

describe('sendBookingConfirmationSchema', () => {
  it('rejects negative total', () => {
    const result = sendBookingConfirmationSchema.safeParse({
      rinkName: 'Main Rink',
      bookingDate: '2025-03-01',
      startTime: '10:00',
      endTime: '12:00',
      hours: 2,
      total: -1,
    });
    expect(result.success).toBe(false);
  });
});
