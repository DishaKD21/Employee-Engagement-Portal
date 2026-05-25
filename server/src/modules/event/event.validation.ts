import { z } from "zod";

const baseEventFormSchema = z.object({
  event_name: z.string().trim().min(1, "Event name is required").max(150),
  event_type: z.string().trim().min(1, "Event type is required").max(50),
  description: z.string().trim().max(2000).optional(),
  target_audience: z.string().trim().min(1, "Target audience is required").max(100),
  registration_start: z.coerce.date(),
  registration_end: z.coerce.date(),
  event_date: z.coerce.date(),
});

const eventFormSchema = baseEventFormSchema.superRefine((value, ctx) => {
  if (value.registration_start > value.registration_end) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["registration_end"], message: "Registration end must be after registration start" });
  }

  if (value.registration_end > value.event_date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["event_date"], message: "Event date must be on or after registration end" });
  }
});

export const createEventSchema = eventFormSchema;

export const updateEventSchema = baseEventFormSchema.partial().superRefine((value, ctx) => {
  if (value.registration_start && value.registration_end && value.registration_start > value.registration_end) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["registration_end"], message: "Registration end must be after registration start" });
  }

  if (value.registration_end && value.event_date && value.registration_end > value.event_date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["event_date"], message: "Event date must be on or after registration end" });
  }
});

export const registerEventSchema = z.object({});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type RegisterEventInput = z.infer<typeof registerEventSchema>;