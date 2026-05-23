import { z } from "zod";

export const registerEventSchema = z.object({
  feedbackRating: z.number().min(1).max(5).optional(),
  feedbackText: z.string().max(2000).optional(),
});