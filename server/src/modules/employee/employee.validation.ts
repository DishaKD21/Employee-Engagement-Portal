import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  language: z.string().max(50).optional(),
  timeZone: z.string().max(50).optional(),
});