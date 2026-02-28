import { describe, expect, it } from 'vitest';
import { notificationActionSchema } from '@/lib/validations/notification';

describe('notificationActionSchema', () => {
  it('accepts mark_read payload', () => {
    const result = notificationActionSchema.safeParse({
      action: 'mark_read',
      notificationId: '11111111-2222-3333-4444-555555555555',
    });
    expect(result.success).toBe(true);
  });

  it('accepts mark_all_read payload', () => {
    const result = notificationActionSchema.safeParse({
      action: 'mark_all_read',
    });
    expect(result.success).toBe(true);
  });

  it('accepts delete payload', () => {
    const result = notificationActionSchema.safeParse({
      action: 'delete',
      notificationId: '11111111-2222-3333-4444-555555555555',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid notification id', () => {
    const result = notificationActionSchema.safeParse({
      action: 'mark_read',
      notificationId: 'invalid-id',
    });
    expect(result.success).toBe(false);
  });
});
