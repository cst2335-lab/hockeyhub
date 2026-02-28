import { describe, expect, it, vi } from 'vitest';
import {
  claimStripeWebhookEvent,
  isStripeWebhookAlreadyProcessedError,
} from '@/lib/stripe/webhook-idempotency';

describe('isStripeWebhookAlreadyProcessedError', () => {
  it('returns true for unique violation code', () => {
    expect(isStripeWebhookAlreadyProcessedError({ code: '23505' })).toBe(true);
  });

  it('returns true when duplicate key appears in message', () => {
    expect(
      isStripeWebhookAlreadyProcessedError({ message: 'duplicate key value violates unique constraint' })
    ).toBe(true);
  });

  it('returns false for non-duplicate errors', () => {
    expect(isStripeWebhookAlreadyProcessedError({ code: '42501', message: 'permission denied' })).toBe(false);
    expect(isStripeWebhookAlreadyProcessedError(null)).toBe(false);
  });
});

describe('claimStripeWebhookEvent', () => {
  it('returns claimed when insert succeeds', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) };
    await expect(claimStripeWebhookEvent(supabase, 'evt_1')).resolves.toBe('claimed');
  });

  it('returns duplicate for unique violation', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) };
    await expect(claimStripeWebhookEvent(supabase, 'evt_1')).resolves.toBe('duplicate');
  });

  it('throws for non-duplicate insert errors', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { code: '42501', message: 'permission denied' } });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) };
    await expect(claimStripeWebhookEvent(supabase, 'evt_1')).rejects.toThrow('permission denied');
  });
});
