import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { logger } from "../../config/logger.js";
import { chatbotService } from "./chatbot.service.js";

export const chatbotController = {
	async query(req: Request, res: Response) {
		const queryText = req.body?.queryText?.trim() || req.body?.query?.trim();

		if (!queryText) {
			throw new ApiError(400, "Query text is required");
		}

		logger.info("Chatbot query received", {
			employeeId: req.user?.employeeId ?? null,
			queryText,
		});

		const result = await chatbotService.query({
			queryText,
			employeeId: req.user?.employeeId ?? undefined,
		});

		logger.info("Chatbot query completed", {
			employeeId: req.user?.employeeId ?? null,
			queryId: result.queryId,
			escalate: result.escalate,
			confidence: result.confidence,
		});

		return sendSuccess(res, result, MESSAGES.FETCHED, 200);
	},

	async history(req: Request, res: Response) {
		const result = await chatbotService.listHistory(req.user?.employeeId ?? undefined);
		return sendSuccess(res, result, MESSAGES.FETCHED, 200);
	},
};