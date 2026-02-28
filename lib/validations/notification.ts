import { z } from 'zod';

export const notificationActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('mark_read'),
    notificationId: z.string().uuid('Invalid notification id'),
  }),
  z.object({
    action: z.literal('mark_all_read'),
  }),
  z.object({
    action: z.literal('delete'),
    notificationId: z.string().uuid('Invalid notification id'),
  }),
]);

export type NotificationActionInput = z.infer<typeof notificationActionSchema>;
