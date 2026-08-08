import { describe, expect, it } from 'vitest';
import { getGameCapacityState, hasValidMaxPlayers } from '@/lib/games/capacity';

describe('hasValidMaxPlayers', () => {
  it('rejects null, undefined, and 0', () => {
    expect(hasValidMaxPlayers(null)).toBe(false);
    expect(hasValidMaxPlayers(undefined)).toBe(false);
    expect(hasValidMaxPlayers(0)).toBe(false);
  });

  it('accepts positive numbers', () => {
    expect(hasValidMaxPlayers(1)).toBe(true);
    expect(hasValidMaxPlayers(10)).toBe(true);
  });
});

describe('getGameCapacityState', () => {
  it('currentPlayers = 0, maxPlayers = null => not full', () => {
    const state = getGameCapacityState({ currentPlayers: 0, maxPlayers: null });
    expect(state.isFull).toBe(false);
    expect(state.hasMaxCapacity).toBe(false);
    expect(state.playersLabel).toBe('0 / Open');
    expect(state.fillPercent).toBe(0);
  });

  it('currentPlayers = 0, maxPlayers = 0 => not full', () => {
    const state = getGameCapacityState({ currentPlayers: 0, maxPlayers: 0 });
    expect(state.isFull).toBe(false);
    expect(state.hasMaxCapacity).toBe(false);
    expect(state.playersLabel).toBe('0 / Open');
    expect(state.fillPercent).toBe(0);
  });

  it('currentPlayers = 10, maxPlayers = 10 => full', () => {
    const state = getGameCapacityState({ currentPlayers: 10, maxPlayers: 10 });
    expect(state.isFull).toBe(true);
    expect(state.spotsLeft).toBe(0);
    expect(state.playersLabel).toBe('10 / 10');
    expect(state.fillPercent).toBe(100);
  });

  it('currentPlayers = 9, maxPlayers = 10 => not full', () => {
    const state = getGameCapacityState({ currentPlayers: 9, maxPlayers: 10 });
    expect(state.isFull).toBe(false);
    expect(state.spotsLeft).toBe(1);
    expect(state.playersLabel).toBe('9 / 10');
    expect(state.fillPercent).toBe(90);
  });

  it('treats undefined maxPlayers as open capacity', () => {
    const state = getGameCapacityState({ currentPlayers: 3, maxPlayers: undefined });
    expect(state.isFull).toBe(false);
    expect(state.playersLabel).toBe('3 / Open');
    expect(state.fillPercent).toBe(0);
  });
});
