import axios from "axios";
import { QueryStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { logger } from "../../config/logger.js";
import type { AIServiceQueryResponse, ChatbotQueryRequest, ChatbotQueryResponse } from "./chatbot.types.js";

const aiClient = axios.create({
	baseURL: env.AI_SERVICE_URL,
	timeout: env.AI_SERVICE_TIMEOUT_MS,
	headers: { "Content-Type": "application/json" },
});

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
		const shouldEscalate = Boolean(aiResponse.escalate || confidence < 0.9);
		const answer = aiResponse.answer ?? null;

		const queryLog = await prisma.queryLog.create({
			data: {
				employeeId: request.employeeId ?? null,
				queryText: request.queryText,
				matchedArticleId,
				confidenceScore: confidence,
				responseDelivered: answer,
				escalationFlag: shouldEscalate,
			},
		});

		let escalationId: number | null = null;

		if (shouldEscalate) {
			const escalation = await prisma.queryEscalation.create({
				data: {
					queryId: queryLog.queryId,
					status: QueryStatus.open,
					assignedTo: null,
				},
			});

			escalationId = escalation.id;
			logger.info("Chatbot query escalated", {
				queryId: queryLog.queryId,
				escalationId,
				confidence,
			});
		}

		return {
			answer: shouldEscalate ? null : answer,
			confidence,
			matchedArticleId: shouldEscalate ? null : matchedArticleId,
			escalate: shouldEscalate,
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