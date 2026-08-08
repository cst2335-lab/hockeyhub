/** Posted-game metric helpers (views + active interests). */

export const INACTIVE_INTEREST_STATUSES = [
  'cancelled',
  'canceled',
  'removed',
  'withdrawn',
  'rejected',
] as const;

export function isActiveInterestStatus(status: string | null | undefined): boolean {
  if (status == null || status === '') return true;
  return !(INACTIVE_INTEREST_STATUSES as readonly string[]).includes(status.toLowerCase());
}

export type PostedGameMetricRow = {
  id: string;
  status: string;
  view_count?: number | null;
  interested_count?: number | null;
};

export type LiveMetricCounts = {
  viewCount: number;
  interestedCount: number;
};

/**
 * Count rows per game id (e.g. from game_views / game_interests selects).
 */
export function countByGameId(
  rows: Array<{ game_id: string }>,
  predicate?: (row: { game_id: string } & Record<string, unknown>) => boolean
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    if (predicate && !predicate(row as { game_id: string } & Record<string, unknown>)) continue;
    out[row.game_id] = (out[row.game_id] ?? 0) + 1;
  }
  return out;
}

/**
 * Prefer live counts when provided; otherwise fall back to denormalized columns.
 */
export function resolvePostedGameMetrics(
  game: PostedGameMetricRow,
  live?: Partial<LiveMetricCounts> | null
): LiveMetricCounts {
  const viewCount =
    live?.viewCount != null ? live.viewCount : Number(game.view_count || 0);
  const interestedCount =
    live?.interestedCount != null
      ? live.interestedCount
      : Number(game.interested_count || 0);
  return {
    viewCount: Number.isFinite(viewCount) ? Math.max(0, viewCount) : 0,
    interestedCount: Number.isFinite(interestedCount) ? Math.max(0, interestedCount) : 0,
  };
}

export function applyLiveMetricsToGames<T extends PostedGameMetricRow>(
  games: T[],
  liveByGameId: Record<string, Partial<LiveMetricCounts>>
): Array<T & { view_count: number; interested_count: number }> {
  return games.map((game) => {
    const resolved = resolvePostedGameMetrics(game, liveByGameId[game.id]);
    return {
      ...game,
      view_count: resolved.viewCount,
      interested_count: resolved.interestedCount,
    };
  });
}

import { isGameActivelyOpen } from '@/lib/games/display-status';

export function summarizePostedGameStats<
  T extends {
    status: string;
    game_date?: string | null;
    game_time?: string | null;
    view_count?: number | null;
    interested_count?: number | null;
  },
>(games: T[], now: Date = new Date()) {
  return {
    total: games.length,
    open: games.filter((g) =>
      isGameActivelyOpen({
        status: g.status,
        gameDate: g.game_date,
        gameTime: g.game_time,
        now,
      })
    ).length,
    matched: games.filter((g) => g.status === 'matched').length,
    cancelled: games.filter((g) => g.status === 'cancelled').length,
    totalViews: games.reduce((sum, g) => sum + Number(g.view_count || 0), 0),
    totalInterested: games.reduce((sum, g) => sum + Number(g.interested_count || 0), 0),
  };
}
