import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendCreated, sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { knowledgeBaseService } from "./knowledge-base.service.js";
import { logger } from "../../config/logger.js";

function parseArticleId(value: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid article id");
  }

  return parsed;
}

export const knowledgeBaseController = {
  async listArticles(_req: Request, res: Response) {
    const result = await knowledgeBaseService.listArticles();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async listPendingApprovals(_req: Request, res: Response) {
    const result = await knowledgeBaseService.listPendingApprovals();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async createArticle(req: Request, res: Response) {
    const result = await knowledgeBaseService.createArticle(req.body, req.user?.employeeId ?? undefined);
    logger.info("Knowledge base article create request completed", {
      employeeId: req.user?.employeeId ?? null,
      articleId: result.articleId,
      status: result.status,
    });
    return sendCreated(res, result, MESSAGES.CREATED);
  },

  async updateArticle(req: Request, res: Response) {
    const articleId = parseArticleId(req.params.id);
    const result = await knowledgeBaseService.updateArticle(articleId, req.body);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async submitForApproval(req: Request, res: Response) {
    const articleId = parseArticleId(req.params.id);
    const result = await knowledgeBaseService.submitForApproval(articleId, req.user?.employeeId ?? undefined);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async approveArticle(req: Request, res: Response) {
    const articleId = parseArticleId(req.params.id);
    const result = await knowledgeBaseService.approveArticle(articleId, req.body?.comments, req.user?.employeeId ?? undefined);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async rejectArticle(req: Request, res: Response) {
    const articleId = parseArticleId(req.params.id);
    const result = await knowledgeBaseService.rejectArticle(articleId, req.body?.comments, req.user?.employeeId ?? undefined);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async publishArticle(req: Request, res: Response) {
    const articleId = parseArticleId(req.params.id);
    const result = await knowledgeBaseService.publishArticle(articleId);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },
};export {};