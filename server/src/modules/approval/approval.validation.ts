import { z } from "zod";

export const approvalActionSchema = z.object({
  comments: z.string().max(2000).optional(),
});