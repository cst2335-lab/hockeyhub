import { describe, expect, it } from 'vitest';
import {
  getGameScheduledAt,
  isGamePast,
  isGameUpcoming,
  localIsoDate,
  parseLocalDateParts,
  parseLocalTimeParts,
} from '@/lib/games/schedule';

describe('parseLocalDateParts', () => {
  it('parses YYYY-MM-DD without UTC shift', () => {
    expect(parseLocalDateParts('2026-08-07')).toEqual({ year: 2026, month: 8, day: 7 });
    expect(parseLocalDateParts('2026-08-07T00:00:00.000Z')).toEqual({
      year: 2026,
      month: 8,
      day: 7,
    });
  });
});

describe('parseLocalTimeParts', () => {
  it('parses HH:mm and HH:mm:ss', () => {
    expect(parseLocalTimeParts('10:00')).toEqual({ hours: 10, minutes: 0, seconds: 0 });
    expect(parseLocalTimeParts('14:30:15')).toEqual({ hours: 14, minutes: 30, seconds: 15 });
  });

  it('defaults missing time to end of day', () => {
    expect(parseLocalTimeParts(null)).toEqual({ hours: 23, minutes: 59, seconds: 59 });
  });
});

describe('game upcoming/past classification', () => {
  const now = new Date(2026, 7, 8, 15, 0, 0); // Aug 8, 2026 15:00 local

  it('classifies yesterday game as past', () => {
    expect(isGamePast('2026-08-07', '10:00', now)).toBe(true);
    expect(isGameUpcoming('2026-08-07', '10:00', now)).toBe(false);
  });

  it('classifies today earlier than current time as past', () => {
    expect(isGamePast('2026-08-08', '10:00', now)).toBe(true);
    expect(isGameUpcoming('2026-08-08', '10:00', now)).toBe(false);
  });

  it('classifies today later than current time as upcoming', () => {
    expect(isGamePast('2026-08-08', '18:00', now)).toBe(false);
    expect(isGameUpcoming('2026-08-08', '18:00', now)).toBe(true);
  });

  it('classifies tomorrow game as upcoming', () => {
    expect(isGamePast('2026-08-09', '10:00', now)).toBe(false);
    expect(isGameUpcoming('2026-08-09', '10:00', now)).toBe(true);
  });

  it('builds local scheduled datetime from date + time', () => {
    const at = getGameScheduledAt('2026-08-07', '10:00', now);
    expect(at).not.toBeNull();
    expect(at!.getFullYear()).toBe(2026);
    expect(at!.getMonth()).toBe(7);
    expect(at!.getDate()).toBe(7);
    expect(at!.getHours()).toBe(10);
    expect(at!.getMinutes()).toBe(0);
  });

  it('localIsoDate avoids UTC toISOString drift', () => {
    const evening = new Date(2026, 7, 8, 21, 0, 0);
    expect(localIsoDate(evening)).toBe('2026-08-08');
  });
});
