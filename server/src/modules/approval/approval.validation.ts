import { z } from "zod";

export const rejectApprovalSchema = z.object({
  comments: z.string().trim().max(500).optional(),
});

export type RejectApprovalInput = z.infer<typeof rejectApprovalSchema>;export {};