import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { auditLogger } from "../../common/services/auditLogger.service.js";
import { logger } from "../../config/logger.js";
import { ApprovalStatus, ContentType } from "@prisma/client";
import { chatbotService } from "../chatbot/chatbot.service.js";
import type { KnowledgeBaseArticleInput, KnowledgeBaseArticleUpdateInput } from "../chatbot/chatbot.types.js";

const articleWriterInclude = {
	writer: {
		select: {
			employeeId: true,
			name: true,
			email: true,
		},
	},
} as const;

type ApprovalClient = Pick<typeof prisma, "approval">;

async function upsertArticleApproval(client: ApprovalClient, articleId: number, status: ApprovalStatus, reviewerId?: number, comments?: string) {
	const existingApproval = await client.approval.findFirst({
		where: { contentType: ContentType.article, contentId: articleId },
		orderBy: { createdAt: "desc" },
	});

	if (existingApproval) {
		return client.approval.update({
			where: { approvalId: existingApproval.approvalId },
			data: {
				status,
				reviewerId,
				comments: comments?.trim() || null,
			},
		});
	}

	return client.approval.create({
		data: {
			contentType: ContentType.article,
			contentId: articleId,
			status,
			reviewerId,
			comments: comments?.trim() || null,
		},
	});
}

export const knowledgeBaseService = {
	async listArticles() {
		return prisma.knowledgeBaseArticle.findMany({
			orderBy: { createdAt: "desc" },
			include: articleWriterInclude,
		});
	},

	async listPendingApprovals() {
		const approvals = await prisma.approval.findMany({
			where: {
				contentType: ContentType.article,
				status: ApprovalStatus.pending,
			},
			orderBy: { createdAt: "desc" },
		});

		const articles = await prisma.knowledgeBaseArticle.findMany({
			where: {
				articleId: {
					in: approvals.map((approval) => approval.contentId).filter((value): value is number => value !== null),
				},
			},
			orderBy: { createdAt: "desc" },
			include: articleWriterInclude,
		});

		const articleById = new Map(articles.map((article) => [article.articleId, article]));

		return approvals
			.filter((approval) => approval.contentId !== null)
			.map((approval) => {
				const article = articleById.get(approval.contentId as number);

				if (!article) {
					return null;
				}

				return {
					approvalId: approval.approvalId,
					approvalStatus: approval.status,
					comments: approval.comments,
					approvalCreatedAt: approval.createdAt,
					...article,
				};
			})
			.filter((item): item is NonNullable<typeof item> => item !== null);
	},

	async createArticle(input: KnowledgeBaseArticleInput, actorEmployeeId?: number) {
		const status = input.status ?? "draft";

		return prisma.$transaction(async (tx) => {
			const createdArticle = await tx.knowledgeBaseArticle.create({
				data: {
					title: input.title,
					content: input.content,
					category: input.category ?? null,
					roleTag: input.roleTag ?? null,
					author: input.author ?? null,
					version: 1,
					status,
				},
				include: articleWriterInclude,
			});

			if (status === "pending_approval") {
				await upsertArticleApproval(tx, createdArticle.articleId, ApprovalStatus.pending);
			}

			logger.info(`Knowledge base article created with status ${status}`, {
				articleId: createdArticle.articleId,
				author: input.author ?? null,
				roleTag: input.roleTag ?? null,
			});

			await auditLogger.logAuditEvent({
				eventType: "Knowledge Base Article Created",
				employeeId: actorEmployeeId ?? input.author,
				contentId: createdArticle.articleId,
				channel: "KNOWLEDGE_BASE",
				outcome: status === "pending_approval" ? "Submitted for approval" : "Draft created",
				reviewerDecision: status === "pending_approval" ? "Pending" : "Draft",
			});

			return createdArticle;
		});
	},

	async updateArticle(articleId: number, input: KnowledgeBaseArticleUpdateInput) {
		const current = await prisma.knowledgeBaseArticle.findUnique({ where: { articleId } });

		if (!current) {
			throw new ApiError(404, "Knowledge base article not found");
		}

		return prisma.knowledgeBaseArticle.update({
			where: { articleId },
			data: {
				...input,
				category: input.category ?? undefined,
				roleTag: input.roleTag ?? undefined,
				status: input.status ?? undefined,
			},
			include: articleWriterInclude,
		});
	},

	async submitForApproval(articleId: number, requestedByEmployeeId?: number) {
		return prisma.$transaction(async (tx) => {
			const updated = await tx.knowledgeBaseArticle.update({
				where: { articleId },
				data: { status: "pending_approval" },
				include: articleWriterInclude,
			});

			await upsertArticleApproval(tx, articleId, ApprovalStatus.pending);

			logger.info("Knowledge base article submitted for approval", { articleId });

			await auditLogger.logAuditEvent({
				eventType: "Knowledge Base Article Submitted For Approval",
				employeeId: requestedByEmployeeId,
				contentId: articleId,
				channel: "KNOWLEDGE_BASE",
				outcome: "Submitted",
				reviewerDecision: "Pending",
			});

			return updated;
		});
	},

	async approveArticle(articleId: number, comments?: string, reviewerEmployeeId?: number) {
		const current = await prisma.knowledgeBaseArticle.findUnique({ where: { articleId } });

		if (!current) {
			throw new ApiError(404, "Knowledge base article not found");
		}

		if (current.status !== "pending_approval") {
			throw new ApiError(400, "Only pending articles can be approved");
		}

		const updated = await prisma.$transaction(async (tx) => {
			const article = await tx.knowledgeBaseArticle.update({
				where: { articleId },
				data: {
					status: "published",
					lastReviewedDate: new Date(),
				},
				include: articleWriterInclude,
			});

			await upsertArticleApproval(tx, articleId, ApprovalStatus.approved, reviewerEmployeeId, comments);

			return article;
		});

		await auditLogger.logAuditEvent({
			eventType: "Knowledge Base Article Approved",
			employeeId: reviewerEmployeeId,
			contentId: articleId,
			channel: "KNOWLEDGE_BASE",
			outcome: "Approved",
			reviewerDecision: "Approved",
		});

		logger.info("Knowledge base article approved", {
			articleId,
			reviewerEmployeeId: reviewerEmployeeId ?? null,
		});

		void chatbotService.indexApprovedArticle(articleId).catch((error) => {
			logger.error(
				`Failed to index approved knowledge base article ${articleId}: ${error instanceof Error ? error.message : String(error)}`,
			);
		});

		return updated;
	},

	async rejectArticle(articleId: number, comments?: string, reviewerEmployeeId?: number) {
		const current = await prisma.knowledgeBaseArticle.findUnique({ where: { articleId } });

		if (!current) {
			throw new ApiError(404, "Knowledge base article not found");
		}

		if (current.status !== "pending_approval") {
			throw new ApiError(400, "Only pending articles can be rejected");
		}

		const updated = await prisma.$transaction(async (tx) => {
			const article = await tx.knowledgeBaseArticle.update({
				where: { articleId },
				data: {
					status: "rejected",
					lastReviewedDate: new Date(),
				},
				include: articleWriterInclude,
			});

			await upsertArticleApproval(tx, articleId, ApprovalStatus.rejected, reviewerEmployeeId, comments);

			return article;
		});

		await auditLogger.logAuditEvent({
			eventType: "Knowledge Base Article Rejected",
			employeeId: reviewerEmployeeId,
			contentId: articleId,
			channel: "KNOWLEDGE_BASE",
			outcome: "Rejected",
			reviewerDecision: "Rejected",
		});

		logger.info("Knowledge base article rejected", {
			articleId,
			reviewerEmployeeId: reviewerEmployeeId ?? null,
		});

		return updated;
	},

	async publishArticle(articleId: number) {
		const current = await prisma.knowledgeBaseArticle.findUnique({ where: { articleId } });

		if (!current) {
			throw new ApiError(404, "Knowledge base article not found");
		}

		if (current.status !== "approved") {
			throw new ApiError(400, "Only approved articles can be published");
		}

		const updated = await prisma.knowledgeBaseArticle.update({
			where: { articleId },
			data: { status: "published", lastReviewedDate: new Date() },
		});

		void chatbotService.indexApprovedArticle(articleId).catch((error) => {
			logger.error(
				`Failed to index published knowledge base article ${articleId}: ${error instanceof Error ? error.message : String(error)}`,
			);
		});
		return updated;
	},
};