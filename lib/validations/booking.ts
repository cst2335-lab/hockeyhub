import { z } from 'zod';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_24H_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** 预订表单基础校验 */
export const bookingFormSchema = z.object({
  bookingDate: z.string().regex(ISO_DATE_RE, 'Date must use YYYY-MM-DD'),
  startTime: z.string().regex(TIME_24H_RE, 'Start time must use HH:mm'),
  hours: z.coerce
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 hour')
    .max(12, 'Duration cannot exceed 12 hours'),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;

export const bookingCheckoutSchema = bookingFormSchema.extend({
  rinkId: z.string().uuid('Invalid rink id'),
  locale: z.enum(['en', 'fr']).optional().default('en'),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid('Invalid booking id'),
});

export const sendBookingConfirmationSchema = z.object({
  rinkName: z.string().trim().min(1, 'Rink name is required').max(120, 'Rink name is too long'),
  bookingDate: z.string().regex(ISO_DATE_RE, 'Booking date must use YYYY-MM-DD'),
  startTime: z.string().regex(TIME_24H_RE, 'Start time must use HH:mm'),
  endTime: z.string().regex(TIME_24H_RE, 'End time must use HH:mm'),
  hours: z.coerce
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 hour')
    .max(12, 'Duration cannot exceed 12 hours'),
  total: z.coerce
    .number()
    .finite('Total must be a finite number')
    .min(0, 'Total cannot be negative')
    .max(50000, 'Total is out of allowed range'),
});

export type BookingCheckoutInput = z.infer<typeof bookingCheckoutSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type SendBookingConfirmationInput = z.infer<typeof sendBookingConfirmationSchema>;
