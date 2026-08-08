import { describe, expect, it } from 'vitest';
import { decideGameViewRecord, nextViewCount } from '@/lib/games/record-view';

describe('decideGameViewRecord', () => {
  it('skips owner views', () => {
    expect(
      decideGameViewRecord({
        viewerId: 'user-a',
        creatorId: 'user-a',
        alreadyViewed: false,
      })
    ).toBe('owner');
  });

  it('skips when viewer already recorded', () => {
    expect(
      decideGameViewRecord({
        viewerId: 'user-b',
        creatorId: 'user-a',
        alreadyViewed: true,
      })
    ).toBe('already_viewed');
  });

  it('records first view from a non-owner', () => {
    expect(
      decideGameViewRecord({
        viewerId: 'user-b',
        creatorId: 'user-a',
        alreadyViewed: false,
      })
    ).toBe('record');
  });
});

describe('nextViewCount', () => {
  it('increments only when decision is record', () => {
    expect(nextViewCount(0, 'record')).toBe(1);
    expect(nextViewCount(3, 'record')).toBe(4);
    expect(nextViewCount(3, 'owner')).toBe(3);
    expect(nextViewCount(3, 'already_viewed')).toBe(3);
  });
});
