import { z } from "zod";

export const chatbotQuerySchema = z
	.object({
		query: z.string().trim().min(2).max(2000).optional(),
		queryText: z.string().trim().min(2).max(2000).optional(),
	})
	.refine((value) => Boolean(value.query?.trim() || value.queryText?.trim()), {
		message: "Query text is required",
		path: ["query"],
	})
	.transform((value) => ({
		queryText: value.query?.trim() || value.queryText?.trim() || "",
	}));