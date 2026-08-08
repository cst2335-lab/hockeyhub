import { describe, expect, it } from 'vitest';
import {
  canExpressGameInterest,
  getGameDisplayStatus,
  getGameDisplayStatusLabel,
  isGameActivelyOpen,
} from '@/lib/games/display-status';

describe('getGameDisplayStatus', () => {
  const now = new Date(2026, 7, 8, 15, 0, 0); // Aug 8 15:00 local

  it('maps open yesterday game to past, not open', () => {
    expect(
      getGameDisplayStatus({
        status: 'open',
        gameDate: '2026-08-07',
        gameTime: '10:00',
        now,
      })
    ).toBe('past');
    expect(getGameDisplayStatusLabel('past')).toBe('past');
  });

  it('maps open today morning (before now) to past', () => {
    expect(
      getGameDisplayStatus({
        status: 'open',
        gameDate: '2026-08-08',
        gameTime: '10:00',
        now,
      })
    ).toBe('past');
  });

  it('keeps open tomorrow as open', () => {
    expect(
      getGameDisplayStatus({
        status: 'open',
        gameDate: '2026-08-09',
        gameTime: '10:00',
        now,
      })
    ).toBe('open');
  });

  it('preserves cancelled future games', () => {
    expect(
      getGameDisplayStatus({
        status: 'cancelled',
        gameDate: '2026-08-09',
        gameTime: '10:00',
        now,
      })
    ).toBe('cancelled');
  });

  it('preserves matched future games', () => {
    expect(
      getGameDisplayStatus({
        status: 'matched',
        gameDate: '2026-08-09',
        gameTime: '10:00',
        now,
      })
    ).toBe('matched');
  });

  it('blocks interest/join for past open games', () => {
    const past = {
      status: 'open',
      gameDate: '2026-08-07',
      gameTime: '10:00',
      now,
    };
    expect(isGameActivelyOpen(past)).toBe(false);
    expect(canExpressGameInterest(past)).toBe(false);
  });

  it('allows interest for open upcoming games', () => {
    const upcoming = {
      status: 'open',
      gameDate: '2026-08-09',
      gameTime: '10:00',
      now,
    };
    expect(isGameActivelyOpen(upcoming)).toBe(true);
    expect(canExpressGameInterest(upcoming)).toBe(true);
  });
});
