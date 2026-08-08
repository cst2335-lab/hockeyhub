import { isGamePast, localIsoDate } from '@/lib/games/schedule';
import {
  getGameDisplayStatus,
  type GameDisplayStatus,
} from '@/lib/games/display-status';

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
  /** UI status after schedule rules (past overrides open). */
  displayStatus?: GameDisplayStatus;
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
  const parse = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (!m) return null;
    return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  };
  const da = parse(a);
  const db = parse(b);
  if (da == null || db == null) return null;
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
      return ageDays == null || ageDays <= 7;
    })
    .map((g) => {
      const row = g as unknown as Game;
      const status = (['open', 'matched', 'closed', 'cancelled'] as GameStatus[]).includes(row.status)
        ? row.status
        : 'open';
      const displayStatus = getGameDisplayStatus({
        status,
        gameDate: row.game_date,
        gameTime: row.game_time,
        now,
      });
      const isExpired = isGamePast(row.game_date, row.game_time, now) || displayStatus === 'past';
      return {
        ...row,
        status,
        displayStatus,
        isExpired,
      } as Game;
    });
}
