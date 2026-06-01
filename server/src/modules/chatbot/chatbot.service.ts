import axios from "axios";
import { NotificationChannel, NotificationStatus, NotificationType, QueryStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { logger } from "../../config/logger.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { auditLogger } from "../../common/services/auditLogger.service.js";
import type { AIServiceQueryResponse, ChatbotQueryRequest, ChatbotQueryResponse } from "./chatbot.types.js";

const aiClient = axios.create({
	baseURL: env.AI_SERVICE_URL,
	timeout: env.AI_SERVICE_TIMEOUT_MS,
	headers: { "Content-Type": "application/json" },
});

async function findHrAssignee() {
	const account = await prisma.authAccount.findFirst({
		where: {
			role: UserRole.HR_COORDINATOR,
			isActive: true,
			employeeId: { not: null },
		},
		orderBy: { id: "asc" },
		select: { employeeId: true },
	});

	return account?.employeeId ?? null;
}

async function notifyHrTeam(escalationId: number, queryText: string) {
	const hrAccounts = await prisma.authAccount.findMany({
		where: {
			role: UserRole.HR_COORDINATOR,
			isActive: true,
			employeeId: { not: null },
		},
		select: { employeeId: true },
	});

	const recipientIds = hrAccounts.map((account) => account.employeeId).filter((employeeId): employeeId is number => employeeId !== null);

	if (!recipientIds.length) {
		logger.info("No active HR users found for query escalation notification", { escalationId });
		return;
	}

	await prisma.notification.createMany({
		data: recipientIds.map((employeeId) => ({
			employeeId,
			title: "Employee query escalated",
			message: `A low-confidence employee query needs HR review: ${queryText.slice(0, 180)}`,
			notificationType: NotificationType.query_response,
			relatedId: escalationId,
			relatedType: "query_escalation",
			channel: NotificationChannel.intranet,
			status: NotificationStatus.sent,
			sentAt: new Date(),
		})),
	});
}

export const chatbotService = {
	async query(request: ChatbotQueryRequest): Promise<ChatbotQueryResponse> {
		let aiResponse: AIServiceQueryResponse;

		logger.info("Sending chatbot query to AI service", {
			employeeId: request.employeeId ?? null,
			queryText: request.queryText,
		});

		try {
			const response = await aiClient.post<AIServiceQueryResponse>("/rag/query", {
				query_text: request.queryText,
			});

			aiResponse = response.data;
			logger.info("AI service query response received", {
				employeeId: request.employeeId ?? null,
				confidence: aiResponse.confidence,
				matchedArticleId: aiResponse.matched_article_id ?? null,
				escalate: aiResponse.escalate,
			});
		} catch (error) {
			logger.error(
				`Failed to query AI service for employee ${request.employeeId ?? "unknown"}: ${error instanceof Error ? error.message : String(error)}`,
			);
			aiResponse = {
				answer: null,
				confidence: 0,
				matched_article_id: null,
				escalate: true,
			};
		}

		const confidence = Number(aiResponse.confidence ?? 0);
		const matchedArticleId = aiResponse.matched_article_id ?? null;
		const persistedMatchedArticleId = matchedArticleId && matchedArticleId > 0 ? matchedArticleId : null;
		// Use the AI service's explicit escalate decision to determine escalation.
		// Do not apply a separate hard-coded threshold here so the AI service
		// controls when to escalate based on its configured threshold.
		const shouldEscalate = Boolean(aiResponse.escalate);
		const answer = aiResponse.answer ?? null;

		const queryLog = await prisma.queryLog.create({
			data: {
				employeeId: request.employeeId ?? null,
				queryText: request.queryText,
				matchedArticleId: shouldEscalate ? null : persistedMatchedArticleId,
				confidenceScore: confidence,
				responseDelivered: shouldEscalate ? null : answer,
				escalationFlag: shouldEscalate,
			},
		});

		let escalationId: number | null = null;

		if (shouldEscalate) {
			const assignedTo = await findHrAssignee();
			const escalation = await prisma.queryEscalation.create({
				data: {
					queryId: queryLog.queryId,
					status: QueryStatus.open,
					assignedTo,
				},
			});

			escalationId = escalation.id;
			await auditLogger.logAuditEvent({
				eventType: "Query Escalated",
				employeeId: request.employeeId,
				contentId: escalationId,
				channel: "CHATBOT",
				outcome: "Pending HR response",
				reviewerDecision: "Pending",
			});
			await auditLogger.logAuditEvent({
				eventType: "Escalation Assigned",
				employeeId: assignedTo ?? undefined,
				contentId: escalationId,
				channel: "QUERY_ESCALATION",
				outcome: assignedTo ? "Assigned to HR" : "Pending HR assignment",
				reviewerDecision: "Pending",
			});
			await notifyHrTeam(escalationId, request.queryText);
			logger.info("Chatbot query escalated", {
				queryId: queryLog.queryId,
				escalationId,
				assignedTo,
				confidence,
			});
		}

		return {
			answer: shouldEscalate ? null : answer,
			confidence,
			matchedArticleId: shouldEscalate ? null : matchedArticleId,
			escalate: shouldEscalate,
			escalated: shouldEscalate,
			message: shouldEscalate
				? "Your query has been escalated to HR. You will receive a response shortly."
				: undefined,
			queryId: queryLog.queryId,
			escalationId,
		};
	},

	async listHistory(employeeId?: number) {
		return prisma.queryLog.findMany({
			where: employeeId ? { employeeId } : undefined,
			orderBy: { createdAt: "desc" },
			take: 25,
			include: {
				matchedArticle: true,
				escalation: true,
			},
		});
	},

	async indexApprovedArticle(articleId: number) {
		const article = await prisma.knowledgeBaseArticle.findUnique({ where: { articleId } });

		if (!article) {
			throw new ApiError(404, "Knowledge base article not found");
		}

		if (article.status !== "approved" && article.status !== "published") {
			throw new ApiError(400, "Only approved articles can be indexed");
		}

		try {
			const response = await aiClient.post("/rag/index-article", {
				article_id: article.articleId,
				title: article.title,
				content: article.content,
				category: article.category,
				role_tag: article.roleTag,
				version: article.version,
			});

			logger.info(`Indexed knowledge base article ${articleId} in AI service with status ${response.status}`);
			return response.data;
		} catch (error) {
			logger.error(`Failed to index knowledge base article ${articleId}: ${error instanceof Error ? error.message : String(error)}`);
			throw new ApiError(502, "AI service indexing failed");
		}
	},
};
