import { describe, expect, it, vi } from 'vitest';
import { fetchRinksListQuery } from '@/lib/queries/rinks';

function buildSupabaseMock(rows: Array<Record<string, unknown>>, error: { message?: string } | null = null) {
  const order = vi.fn().mockResolvedValue({ data: rows, error });
  const select = vi.fn().mockReturnValue({ order });
  const from = vi.fn().mockReturnValue({ select });
  return { from };
}

describe('fetchRinksListQuery', () => {
  it('returns rinks rows as-is', async () => {
    const supabase = buildSupabaseMock([
      {
        id: 'r1',
        name: 'Arena One',
        address: '123 Main St',
        city: 'Ottawa',
        phone: null,
        hourly_rate: 180,
        amenities: ['Locker Room'],
        booking_url: null,
      },
    ]);

    const rinks = await fetchRinksListQuery(supabase);
    expect(rinks).toHaveLength(1);
    expect(rinks[0].name).toBe('Arena One');
  });

  it('throws when supabase returns an error', async () => {
    const supabase = buildSupabaseMock([], { message: 'failed to load' });
    await expect(fetchRinksListQuery(supabase)).rejects.toThrow('failed to load');
  });
});
