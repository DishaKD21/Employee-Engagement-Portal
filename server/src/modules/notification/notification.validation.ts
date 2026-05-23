import { z } from "zod";

export const sendNotificationSchema = z.object({
  employeeId: z.number().int().positive().optional(),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  relatedId: z.number().int().optional(),
  relatedType: z.string().max(50).optional(),
  channel: z.string().optional(),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
