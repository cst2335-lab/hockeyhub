import { describe, expect, it } from 'vitest';
import {
  applyLiveMetricsToGames,
  countByGameId,
  isActiveInterestStatus,
  resolvePostedGameMetrics,
  summarizePostedGameStats,
} from '@/lib/games/posted-metrics';

describe('isActiveInterestStatus', () => {
  it('treats pending and accepted as active', () => {
    expect(isActiveInterestStatus('pending')).toBe(true);
    expect(isActiveInterestStatus('accepted')).toBe(true);
    expect(isActiveInterestStatus(null)).toBe(true);
  });

  it('excludes removed/cancelled interests', () => {
    expect(isActiveInterestStatus('removed')).toBe(false);
    expect(isActiveInterestStatus('cancelled')).toBe(false);
    expect(isActiveInterestStatus('withdrawn')).toBe(false);
  });
});

describe('countByGameId', () => {
  it('counts rows per game and supports interest status filtering', () => {
    const rows = [
      { game_id: 'g1', status: 'pending' },
      { game_id: 'g1', status: 'removed' },
      { game_id: 'g2', status: 'accepted' },
    ];
    expect(countByGameId(rows)).toEqual({ g1: 2, g2: 1 });
    expect(
      countByGameId(rows, (row) => isActiveInterestStatus(row.status as string))
    ).toEqual({ g1: 1, g2: 1 });
  });
});

describe('resolvePostedGameMetrics / applyLiveMetricsToGames', () => {
  it('prefers live counts over stale denormalized columns', () => {
    expect(
      resolvePostedGameMetrics(
        { id: 'g1', status: 'open', view_count: 0, interested_count: 0 },
        { viewCount: 3, interestedCount: 2 }
      )
    ).toEqual({ viewCount: 3, interestedCount: 2 });
  });

  it('falls back to denormalized columns when live metrics are missing', () => {
    expect(
      resolvePostedGameMetrics({
        id: 'g1',
        status: 'open',
        view_count: 4,
        interested_count: 1,
      })
    ).toEqual({ viewCount: 4, interestedCount: 1 });
  });

  it('applies live metrics onto posted game cards', () => {
    const games = applyLiveMetricsToGames(
      [
        { id: 'g1', status: 'open', view_count: 0, interested_count: 0 },
        { id: 'g2', status: 'open', view_count: 9, interested_count: 9 },
      ],
      {
        g1: { viewCount: 1, interestedCount: 1 },
      }
    );
    expect(games[0].view_count).toBe(1);
    expect(games[0].interested_count).toBe(1);
    expect(games[1].view_count).toBe(9);
    expect(games[1].interested_count).toBe(9);
  });
});

describe('summarizePostedGameStats', () => {
  it('sums live view and interest counts for dashboard totals', () => {
    const stats = summarizePostedGameStats([
      { status: 'open', view_count: 1, interested_count: 2 },
      { status: 'matched', view_count: 3, interested_count: 1 },
      { status: 'cancelled', view_count: 0, interested_count: 0 },
    ]);
    expect(stats).toEqual({
      total: 3,
      open: 1,
      matched: 1,
      cancelled: 1,
      totalViews: 4,
      totalInterested: 3,
    });
  });

  it('excludes past open games from active open count', () => {
    const now = new Date(2026, 7, 8, 15, 0, 0);
    const stats = summarizePostedGameStats(
      [
        { status: 'open', game_date: '2026-08-07', game_time: '10:00', view_count: 1, interested_count: 1 },
        { status: 'open', game_date: '2026-08-09', game_time: '10:00', view_count: 0, interested_count: 0 },
      ],
      now
    );
    expect(stats.open).toBe(1);
    expect(stats.total).toBe(2);
  });
});
