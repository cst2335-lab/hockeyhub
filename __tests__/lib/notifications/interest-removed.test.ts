import { describe, expect, it, vi } from 'vitest';
import { notifyInterestRemoved } from '@/lib/notifications/interest-removed';

describe('notifyInterestRemoved', () => {
  it('skips when remover is the creator', async () => {
    const insert = vi.fn();
    const result = await notifyInterestRemoved({
      client: { from: () => ({ insert }) },
      creatorId: 'user-a',
      removerId: 'user-a',
      gameId: 'game-1',
      gameTitle: 'Friday Game',
    });
    expect(result).toEqual({ notified: false, skipped: 'owner_or_missing' });
    expect(insert).not.toHaveBeenCalled();
  });

  it('inserts a concise notification for the creator', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const result = await notifyInterestRemoved({
      client: { from: () => ({ insert }) },
      creatorId: 'user-a',
      removerId: 'user-b',
      gameId: 'game-1',
      gameTitle: 'Friday Game',
    });
    expect(result).toEqual({ notified: true });
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-a',
      type: 'interest_removed',
      title: 'Interest removed',
      message: 'A player removed interest from your game: Friday Game',
      link: '/games/game-1',
      related_id: 'game-1',
      is_read: false,
    });
  });

  it('returns insert_failed without throwing when insert errors', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'boom' } });
    const result = await notifyInterestRemoved({
      client: { from: () => ({ insert }) },
      creatorId: 'user-a',
      removerId: 'user-b',
      gameId: 'game-1',
      gameTitle: 'Friday Game',
    });
    expect(result).toEqual({ notified: false, skipped: 'insert_failed' });
  });
});
