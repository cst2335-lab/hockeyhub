import { z } from 'zod';

const AGE_GROUPS = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'] as const;
const SKILL_LEVELS = ['AAA', 'AA', 'A', 'B', 'C', 'House League', 'Beginner'] as const;
const POSITIONS = ['Forward', 'Defense', 'Goalie', 'Any'] as const;
const AREAS = [
  'Downtown Ottawa',
  'Ottawa East',
  'Ottawa West',
  'Ottawa South',
  'Kanata',
  'Nepean',
  'Orleans',
  'Gloucester',
  'Barrhaven',
  'Stittsville',
] as const;

const OPTIONAL_TEXT_40 = z.string().max(40).optional().or(z.literal(''));
const OPTIONAL_TEXT_1000 = z.string().max(1000).optional().or(z.literal(''));

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required').max(120, 'Full name is too long'),
  age_group: z.enum(AGE_GROUPS, { message: 'Invalid age group' }),
  skill_level: z.enum(SKILL_LEVELS, { message: 'Invalid skill level' }),
  position: z.enum(POSITIONS, { message: 'Invalid position' }),
  area: z.enum(AREAS, { message: 'Invalid area' }),
  years_playing: z.coerce
    .number()
    .int('Years playing must be a whole number')
    .min(0, 'Years playing cannot be negative')
    .max(50, 'Years playing is too large')
    .optional()
    .default(0),
  phone: OPTIONAL_TEXT_40,
  jersey_number: z
    .string()
    .max(3, 'Jersey number must be 3 digits or less')
    .optional()
    .or(z.literal(''))
    .refine((value) => value === '' || /^\d{1,3}$/.test(value), 'Jersey number must be numeric'),
  preferred_shot: z.enum(['Left', 'Right']).optional().or(z.literal('')),
  bio: OPTIONAL_TEXT_1000,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const ensureProfileSchema = z.object({
  full_name: z.string().trim().max(120).optional().or(z.literal('')),
});

export type EnsureProfileInput = z.infer<typeof ensureProfileSchema>;
