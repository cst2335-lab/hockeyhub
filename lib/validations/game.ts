import { z } from 'zod';

/** 创建比赛邀请表单校验 */
export const createGameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  game_date: z.string().min(1, 'Date is required'),
  game_time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be 200 characters or less'),
  age_group: z.string().min(1, 'Age group is required'),
  skill_level: z.string().min(1, 'Skill level is required'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional().or(z.literal('')),
  max_players: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .refine((v) => v === undefined || (Number(v) >= 1 && Number(v) <= 50), 'Max players must be between 1 and 50'),
  contact_info: z.string().max(200, 'Contact info must be 200 characters or less').optional().or(z.literal('')),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;

export const gameStatusSchema = z.enum(['open', 'matched', 'closed', 'cancelled']);

export const updateGameSchema = createGameSchema.extend({
  gameId: z.string().uuid('Invalid game id'),
  status: gameStatusSchema,
});

export type UpdateGameInput = z.infer<typeof updateGameSchema>;

export const gameInterestSchema = z.object({
  gameId: z.string().uuid('Invalid game id'),
  message: z.string().max(1000, 'Message must be 1000 characters or less').optional().or(z.literal('')),
});

export const gameRatingSchema = z.object({
  gameId: z.string().uuid('Invalid game id'),
  rating: z.coerce.number().int('Rating must be a whole number').min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500, 'Comment must be 500 characters or less').optional().or(z.literal('')),
});

export type GameInterestInput = z.infer<typeof gameInterestSchema>;
export type GameRatingInput = z.infer<typeof gameRatingSchema>;
