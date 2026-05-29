import { z } from "zod";

const articleStatusSchema = z.enum(["draft", "pending_approval", "approved", "rejected", "published"]);

const knowledgeBaseArticleBaseSchema = z.object({
	title: z.string().trim().min(3).max(200),
	content: z.string().trim().min(10),
	category: z.string().trim().max(100).optional(),
	roleTag: z.string().trim().max(100).optional(),
	role_tag: z.string().trim().max(100).optional(),
	author: z.number().int().positive().optional(),
	status: articleStatusSchema.optional(),
});

export const knowledgeBaseArticleSchema = knowledgeBaseArticleBaseSchema
	.transform((input) => ({
		title: input.title,
		content: input.content,
		category: input.category,
		roleTag: input.roleTag ?? input.role_tag,
		author: input.author,
		status: input.status,
	}));

export const knowledgeBaseArticleUpdateSchema = knowledgeBaseArticleBaseSchema
	.partial()
	.extend({
		version: z.number().int().positive().optional(),
	})
	.transform((input) => ({
		title: input.title,
		content: input.content,
		category: input.category,
		roleTag: input.roleTag ?? input.role_tag,
		author: input.author,
		status: input.status,
		version: input.version,
	}));

export const approvalActionSchema = z.object({
	comments: z.string().trim().max(2000).optional(),
});
