import { z } from "zod";

export const queryEscalationResolutionSchema = z.object({
  resolutionText: z.string().trim().min(3).max(4000),
  assignedTo: z.number().int().positive().optional(),
});