import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.string().max(100).optional(),
  roleTag: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
