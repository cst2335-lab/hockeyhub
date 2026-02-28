import { z } from 'zod';

const OPTIONAL_TEXT_MAX_1000 = z.string().max(1000).optional().or(z.literal(''));
const OPTIONAL_TEXT_MAX_200 = z.string().max(200).optional().or(z.literal(''));

export const manageRinkUpdateSchema = z.object({
  rinkId: z.string().uuid('Invalid rink id'),
  hourly_rate: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((value) => {
      if (!value) return true;
      const num = Number(value);
      return Number.isFinite(num) && num >= 0;
    }, 'Hourly rate must be a non-negative number'),
  booking_url: z.string().max(1000).optional().or(z.literal('')),
  amenities: OPTIONAL_TEXT_MAX_1000,
  peak_hours: OPTIONAL_TEXT_MAX_200,
  special_notes: OPTIONAL_TEXT_MAX_1000,
});

export type ManageRinkUpdateInput = z.infer<typeof manageRinkUpdateSchema>;
