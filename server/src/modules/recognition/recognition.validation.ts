import { z } from "zod";

export const recognitionEventTypeSchema = z.enum(["BIRTHDAY", "WORK_ANNIVERSARY"]);

export const createRecognitionTemplateSchema = z.object({
  template_name: z.string().trim().min(1).max(100),
  event_type: recognitionEventTypeSchema,
  content: z.string().trim().min(1),
});

export const updateRecognitionTemplateSchema = createRecognitionTemplateSchema.partial();

export const rejectRecognitionTemplateSchema = z.object({
  comments: z.string().trim().max(500).optional(),
});

export type CreateRecognitionTemplateInput = z.infer<typeof createRecognitionTemplateSchema>;
export type UpdateRecognitionTemplateInput = z.infer<typeof updateRecognitionTemplateSchema>;
export type RejectRecognitionTemplateInput = z.infer<typeof rejectRecognitionTemplateSchema>;