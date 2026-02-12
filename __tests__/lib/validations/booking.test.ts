import { describe, it, expect } from 'vitest';
import { bookingFormSchema } from '@/lib/validations/booking';

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
});
