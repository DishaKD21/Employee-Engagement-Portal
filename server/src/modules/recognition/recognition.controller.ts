import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendCreated, sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { logger } from "../../config/logger.js";
import fs from "fs";
import path from "path";
import { recognitionService } from "./recognition.service.js";

function getIdParam(value: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid id");
  }

  return parsed;
}

export const recognitionController = {
  async getTemplates(_req: Request, res: Response) {
    const result = await recognitionService.getTemplates();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async createTemplate(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    // Write a lightweight request dump to a file for debugging (development only)
    try {
      const logsDir = path.join(process.cwd(), "logs");
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
      const out = {
        time: new Date().toISOString(),
        route: "/api/recognition/templates/create",
        body: req.body,
        userRole: req.user?.role,
        employeeId: req.user?.employeeId,
      };
      fs.appendFileSync(path.join(logsDir, "recognition_requests.log"), JSON.stringify(out) + "\n");
    } catch (err) {
      // don't fail the request if logging fails
      logger.error("[recognition-template:create] request logging failed", err as unknown);
    }

    logger.info("[recognition-template:create] controller request", {
      body: req.body,
      userRole: req.user.role,
      employeeId: req.user.employeeId,
    });

    const result = await recognitionService.createTemplate(req.body, req.user.employeeId);
    logger.info("[recognition-template:create] controller response", result);
    return sendCreated(res, result, MESSAGES.CREATED);
  },

  async updateTemplate(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const templateId = getIdParam(req.params.id);
    const result = await recognitionService.updateTemplate(templateId, req.user.employeeId, req.body);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async deleteTemplate(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const templateId = getIdParam(req.params.id);
    const result = await recognitionService.deleteTemplate(templateId, req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.DELETED, 200);
  },

  async getTemplateApprovals(_req: Request, res: Response) {
    const result = await recognitionService.getTemplateApprovals();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async approveTemplate(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Reviewer employee id is required");
    }

    const approvalId = getIdParam(req.params.id);
    const result = await recognitionService.approveTemplate(approvalId, req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async rejectTemplate(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Reviewer employee id is required");
    }

    const approvalId = getIdParam(req.params.id);
    const result = await recognitionService.rejectTemplate(approvalId, req.user.employeeId, req.body);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async getRecognitionEvents(_req: Request, res: Response) {
    const result = await recognitionService.getRecognitionEvents();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },
};