import { z } from 'zod';

/** 预订表单基础校验 */
export const bookingFormSchema = z.object({
  bookingDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  hours: z.number().min(1, 'Duration must be at least 1 hour').max(12, 'Duration cannot exceed 12 hours'),
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
