import { describe, expect, it, vi } from 'vitest';
import { fetchGamesListQuery } from '@/lib/queries/games';

function buildSupabaseMock(rows: Array<Record<string, unknown>>, error: { message?: string } | null = null) {
  const order = vi.fn().mockResolvedValue({ data: rows, error });
  const select = vi.fn().mockReturnValue({ order });
  const from = vi.fn().mockReturnValue({ select });
  return { from };
}

describe('fetchGamesListQuery', () => {
  const now = new Date(2026, 7, 8, 15, 0, 0); // Aug 8, 2026 15:00 local

  it('normalizes invalid status and marks future games as not expired', async () => {
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

    const games = await fetchGamesListQuery(supabase, now);
    expect(games).toHaveLength(1);
    expect(games[0].status).toBe('open');
    expect(games[0].isExpired).toBe(false);
  });

  it('marks yesterday game as expired (past) even with a daytime kickoff', async () => {
    const supabase = buildSupabaseMock([
      {
        id: 'y',
        title: 'Yesterday game',
        game_date: '2026-08-07',
        game_time: '10:00',
        age_group: 'U15',
        skill_level: 'Intermediate',
        description: 'Demo',
        status: 'open',
        created_at: '2026-08-01T00:00:00.000Z',
      },
    ]);

    const games = await fetchGamesListQuery(supabase, now);
    expect(games).toHaveLength(1);
    expect(games[0].isExpired).toBe(true);
  });

  it('marks today morning as past and today evening as upcoming', async () => {
    const supabase = buildSupabaseMock([
      {
        id: 'am',
        title: 'Morning',
        game_date: '2026-08-08',
        game_time: '10:00',
        age_group: 'U15',
        skill_level: 'A',
        description: '',
        status: 'open',
        created_at: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'pm',
        title: 'Evening',
        game_date: '2026-08-08',
        game_time: '18:00',
        age_group: 'U15',
        skill_level: 'A',
        description: '',
        status: 'open',
        created_at: '2026-08-01T00:00:00.000Z',
      },
    ]);

    const games = await fetchGamesListQuery(supabase, now);
    expect(games.find((g) => g.id === 'am')?.isExpired).toBe(true);
    expect(games.find((g) => g.id === 'pm')?.isExpired).toBe(false);
  });

  it('drops games older than seven local calendar days', async () => {
    const oldDateStr = '2000-01-01';

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

    const games = await fetchGamesListQuery(supabase, now);
    expect(games).toHaveLength(0);
  });

  it('throws when supabase returns an error', async () => {
    const supabase = buildSupabaseMock([], { message: 'boom' });
    await expect(fetchGamesListQuery(supabase, now)).rejects.toThrow('boom');
  });
});
