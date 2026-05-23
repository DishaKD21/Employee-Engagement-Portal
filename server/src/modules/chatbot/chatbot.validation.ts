import { z } from "zod";

export const submitQuerySchema = z.object({
  queryText: z.string().min(1).max(5000),
});