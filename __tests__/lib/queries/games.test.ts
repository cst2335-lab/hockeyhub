import { describe, expect, it, vi } from 'vitest';
import { fetchGamesListQuery } from '@/lib/queries/games';

function buildSupabaseMock(rows: Array<Record<string, unknown>>, error: { message?: string } | null = null) {
  const order = vi.fn().mockResolvedValue({ data: rows, error });
  const select = vi.fn().mockReturnValue({ order });
  const from = vi.fn().mockReturnValue({ select });
  return { from };
}

describe('fetchGamesListQuery', () => {
  it('normalizes invalid status and computes isExpired', async () => {
    const supabase = buildSupabaseMock([
      {
        id: '1',
        title: 'Morning game',
        game_date: '2099-01-01',
        game_time: '09:00',
        age_group: 'Adult',
        skill_level: 'Intermediate',
        description: 'Pickup',
        status: 'unknown',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const games = await fetchGamesListQuery(supabase);
    expect(games).toHaveLength(1);
    expect(games[0].status).toBe('open');
    expect(games[0].isExpired).toBe(false);
  });

  it('drops games older than seven days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 8);
    const oldDateStr = oldDate.toISOString().slice(0, 10);

    const supabase = buildSupabaseMock([
      {
        id: '2',
        title: 'Old game',
        game_date: oldDateStr,
        game_time: '09:00',
        age_group: 'Adult',
        skill_level: 'Intermediate',
        description: 'Old',
        status: 'open',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const games = await fetchGamesListQuery(supabase);
    expect(games).toHaveLength(0);
  });

  it('throws when supabase returns an error', async () => {
    const supabase = buildSupabaseMock([], { message: 'boom' });
    await expect(fetchGamesListQuery(supabase)).rejects.toThrow('boom');
  });
});
