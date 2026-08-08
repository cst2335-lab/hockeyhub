import {
  applyLiveMetricsToGames,
  summarizePostedGameStats,
  type LiveMetricCounts,
  type PostedGameMetricRow,
} from '@/lib/games/posted-metrics';

/**
 * Minimal query surface used by this helper.
 * Kept shallow on purpose: assigning the real Supabase client into a deep
 * structural type causes "Type instantiation is excessively deep".
 */
type MyGamesQueryResult = {
  data: unknown[] | null;
  error: { message?: string } | null;
};

type MyGamesDb = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, opts: { ascending: boolean }) => PromiseLike<MyGamesQueryResult>;
      };
    };
  };
};

/**
 * Load the current user's posted games + games they are interested in,
 * enriching posted games with live view/interest metrics from `/api/games/posted-metrics`.
 */
export async function fetchMyGamesWithLiveMetrics<TGame extends PostedGameMetricRow>(params: {
  /** Browser/server Supabase client. Typed as unknown to avoid deep generic instantiation. */
  supabase: unknown;
  userId: string;
  fetchMetrics?: () => Promise<Record<string, LiveMetricCounts>>;
}) {
  const { userId } = params;
  const supabase = params.supabase as MyGamesDb;

  const [gamesRes, interestsRes] = await Promise.all([
    supabase
      .from('game_invitations')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('game_interests')
      .select('*, game_invitations (*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (gamesRes.error) throw gamesRes.error;

  const gamesData = (gamesRes.data || []) as TGame[];
  const interestedData = (interestsRes.data || []) as Array<{
    id: string;
    game_id: string;
    user_id: string;
    status: string;
    created_at: string;
    game_invitations: TGame;
  }>;

  let liveByGameId: Record<string, LiveMetricCounts> = {};
  try {
    if (params.fetchMetrics) {
      liveByGameId = await params.fetchMetrics();
    } else if (typeof fetch !== 'undefined') {
      const res = await fetch('/api/games/posted-metrics', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (res.ok) {
        const body = (await res.json()) as { metrics?: Record<string, LiveMetricCounts> };
        liveByGameId = body.metrics ?? {};
      }
    }
  } catch (e) {
    console.error('fetchMyGamesWithLiveMetrics metrics error:', e);
  }

  const games = applyLiveMetricsToGames(gamesData, liveByGameId);
  const stats = summarizePostedGameStats(games);

  return {
    games,
    interestedGames: interestedData,
    stats,
  };
}
