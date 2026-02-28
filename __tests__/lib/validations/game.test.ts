import { describe, it, expect } from 'vitest';
import {
  createGameSchema,
  gameInterestSchema,
  gameRatingSchema,
  updateGameSchema,
} from '@/lib/validations/game';

describe('createGameSchema', () => {
  it('accepts valid create payload', () => {
    const result = createGameSchema.safeParse({
      title: 'U13 Friendly Match',
      game_date: '2026-03-10',
      game_time: '18:30',
      location: 'Bell Sensplex',
      age_group: 'U13',
      skill_level: 'Intermediate',
      description: 'Bring both dark and white jerseys',
      max_players: '20',
      contact_info: 'Coach Alex',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateGameSchema', () => {
  it('accepts valid update payload', () => {
    const result = updateGameSchema.safeParse({
      gameId: '11111111-2222-3333-4444-555555555555',
      title: 'Updated title',
      game_date: '2026-03-10',
      game_time: '18:30',
      location: 'Bell Sensplex',
      age_group: 'U13',
      skill_level: 'Intermediate',
      description: '',
      max_players: '18',
      contact_info: '',
      status: 'open',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid game id', () => {
    const result = updateGameSchema.safeParse({
      gameId: 'game-123',
      title: 'Updated title',
      game_date: '2026-03-10',
      game_time: '18:30',
      location: 'Bell Sensplex',
      age_group: 'U13',
      skill_level: 'Intermediate',
      status: 'open',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = updateGameSchema.safeParse({
      gameId: '11111111-2222-3333-4444-555555555555',
      title: 'Updated title',
      game_date: '2026-03-10',
      game_time: '18:30',
      location: 'Bell Sensplex',
      age_group: 'U13',
      skill_level: 'Intermediate',
      status: 'pending',
    });
    expect(result.success).toBe(false);
  });
});

describe('gameInterestSchema', () => {
  it('accepts valid interest payload', () => {
    const result = gameInterestSchema.safeParse({
      gameId: '11111111-2222-3333-4444-555555555555',
      message: 'Interested in joining.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects too long interest message', () => {
    const result = gameInterestSchema.safeParse({
      gameId: '11111111-2222-3333-4444-555555555555',
      message: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('gameRatingSchema', () => {
  it('accepts valid rating payload', () => {
    const result = gameRatingSchema.safeParse({
      gameId: '11111111-2222-3333-4444-555555555555',
      rating: 4,
      comment: 'Good experience',
    });
    expect(result.success).toBe(true);
  });

  it('rejects out-of-range rating', () => {
    const result = gameRatingSchema.safeParse({
      gameId: '11111111-2222-3333-4444-555555555555',
      rating: 6,
      comment: 'Too high',
    });
    expect(result.success).toBe(false);
  });
});
