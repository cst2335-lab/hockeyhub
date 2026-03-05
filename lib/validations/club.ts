import { z } from 'zod';

const CURRENT_YEAR = new Date().getFullYear();
const CLUB_AGE_GROUPS = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18'] as const;

const OPTIONAL_TEXT_40 = z.string().max(40).optional().or(z.literal(''));
const OPTIONAL_TEXT_120 = z.string().max(120).optional().or(z.literal(''));
const OPTIONAL_TEXT_1000 = z.string().max(1000).optional().or(z.literal(''));
const OPTIONAL_URL_2000 = z.string().max(2000).optional().or(z.literal(''));

export const createClubSchema = z.object({
  name: z.string().trim().min(1, 'Club name is required').max(120, 'Club name is too long'),
  description: OPTIONAL_TEXT_1000,
  contact_email: z.string().trim().email('Invalid contact email').max(254),
  contact_phone: OPTIONAL_TEXT_40,
  website: OPTIONAL_URL_2000,
  founded_year: z.coerce
    .number()
    .int('Founded year must be a whole number')
    .min(1900, 'Founded year is too early')
    .max(CURRENT_YEAR, 'Founded year cannot be in the future'),
  home_rink: OPTIONAL_TEXT_120,
  age_groups: z
    .array(z.enum(CLUB_AGE_GROUPS, { message: 'Invalid age group' }))
    .max(6, 'Too many age groups')
    .optional()
    .default([])
    .transform((groups) => Array.from(new Set(groups))),
});

export type CreateClubInput = z.infer<typeof createClubSchema>;
