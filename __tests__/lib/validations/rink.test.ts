import { describe, expect, it } from 'vitest';
import { manageRinkUpdateSchema } from '@/lib/validations/rink';

describe('manageRinkUpdateSchema', () => {
  it('accepts valid payload', () => {
    const result = manageRinkUpdateSchema.safeParse({
      rinkId: '11111111-2222-3333-4444-555555555555',
      hourly_rate: '180',
      booking_url: 'https://example.com/book',
      amenities: 'parking, canteen',
      peak_hours: 'Weekdays 6-9pm',
      special_notes: 'Bring your own gear',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative hourly rate', () => {
    const result = manageRinkUpdateSchema.safeParse({
      rinkId: '11111111-2222-3333-4444-555555555555',
      hourly_rate: '-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid rink id', () => {
    const result = manageRinkUpdateSchema.safeParse({
      rinkId: 'rink-1',
      hourly_rate: '100',
    });
    expect(result.success).toBe(false);
  });
});
