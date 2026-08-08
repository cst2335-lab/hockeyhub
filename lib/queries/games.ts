import { isGamePast, localIsoDate, parseLocalDateParts } from '@/lib/games/schedule';

export type GameStatus = 'open' | 'matched' | 'closed' | 'cancelled';

export type Game = {
  id: string;
  title: string;
  game_date: string;
  game_time: string;
  age_group: string;
  skill_level: string;
  description: string;
  status: GameStatus;
  location?: string;
  view_count?: number;
  interested_count?: number;
  created_at: string;
  isExpired?: boolean;
};

type PostgrestErrorLike = { message?: string | null } | null;
type PostgrestResponse<T> = { data: T | null; error: PostgrestErrorLike };

type GamesQueryBuilder = {
  select: (columns: string) => {
    order: (
      column: string,
      options?: { ascending?: boolean }
    ) => PromiseLike<PostgrestResponse<Array<Record<string, unknown>>>>;
  };
};

type SupabaseGamesClient = {
  from: (table: 'game_invitations') => GamesQueryBuilder;
};

function daysBetweenLocalDates(a: string, b: string): number | null {
  const pa = parseLocalDateParts(a);
  const pb = parseLocalDateParts(b);
  if (!pa || !pb) return null;
  const da = Date.UTC(pa.year, pa.month - 1, pa.day);
  const db = Date.UTC(pb.year, pb.month - 1, pb.day);
  return Math.round((da - db) / (24 * 60 * 60 * 1000));
}

export async function fetchGamesListQuery(
  supabase: SupabaseGamesClient,
  now: Date = new Date()
): Promise<Game[]> {
  const { data, error } = await supabase
    .from('game_invitations')
    .select('*')
    .order('game_date', { ascending: true });

  if (error) throw new Error(error.message ?? 'Failed to load games');

  const todayStr = localIsoDate(now);

  return (data ?? [])
    .filter((g) => {
      const gameDate = typeof g.game_date === 'string' ? g.game_date : '';
      if (!gameDate) return true;
      const ageDays = daysBetweenLocalDates(todayStr, gameDate.slice(0, 10));
      // Keep games from the last 7 local calendar days (and future).
      return ageDays == null || ageDays <= 7;
    })
    .map((g) => {
      const row = g as unknown as Game;
      return {
        ...row,
        status: (['open', 'matched', 'closed', 'cancelled'] as GameStatus[]).includes(row.status)
          ? row.status
          : 'open',
        isExpired: isGamePast(row.game_date, row.game_time, now),
      } as Game;
    });
}
