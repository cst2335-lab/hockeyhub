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

export async function fetchGamesListQuery(supabase: SupabaseGamesClient): Promise<Game[]> {
  const { data, error } = await supabase
    .from('game_invitations')
    .select('*')
    .order('game_date', { ascending: true });

  if (error) throw new Error(error.message ?? 'Failed to load games');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  return (data ?? [])
    .filter((g) => {
      const gameDate = typeof g.game_date === 'string' ? g.game_date : '';
      return !gameDate || gameDate >= sevenDaysAgoStr;
    })
    .map((g) => {
      const row = g as unknown as Game;
      return {
        ...row,
        status: (['open', 'matched', 'closed', 'cancelled'] as GameStatus[]).includes(row.status)
          ? row.status
          : 'open',
        isExpired: row.game_date ? row.game_date < todayStr : false,
      } as Game;
    });
}
