import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendCreated, sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { surveyService } from "./survey.service.js";

function getSurveyIdParam(value: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid survey id");
  }

  return parsed;
}

function getApprovalIdParam(value: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid approval id");
  }

  return parsed;
}

export const surveyController = {
  async createSurvey(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const result = await surveyService.createSurvey(req.body, req.user.employeeId);
    return sendCreated(res, result, MESSAGES.CREATED);
  },

  async getMySurveys(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const result = await surveyService.getMySurveys(req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async updateSurvey(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const surveyId = getSurveyIdParam(req.params.id);
    const result = await surveyService.updateSurvey(surveyId, req.user.employeeId, req.body);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async deleteSurvey(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const surveyId = getSurveyIdParam(req.params.id);
    const result = await surveyService.deleteSurvey(surveyId, req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.DELETED, 200);
  },

  async getPendingApprovals(_req: Request, res: Response) {
    const result = await surveyService.getPendingApprovals();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async approveSurvey(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Reviewer employee id is required");
    }

    const approvalId = getApprovalIdParam(req.params.id);
    const result = await surveyService.approveSurvey(approvalId, req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async rejectSurvey(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Reviewer employee id is required");
    }

    const approvalId = getApprovalIdParam(req.params.id);
    const result = await surveyService.rejectSurvey(approvalId, req.user.employeeId, req.body);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async getPublishedSurveys(_req: Request, res: Response) {
    const result = await surveyService.getPublishedSurveys();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async getSurveyById(req: Request, res: Response) {
    const surveyId = getSurveyIdParam(req.params.id);
    const result = await surveyService.getSurveyById(surveyId);
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async submitSurvey(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Employee id is required");
    }

    const surveyId = getSurveyIdParam(req.params.id);
    const result = await surveyService.submitSurvey(surveyId, req.user.employeeId, req.body);
    return sendCreated(res, result, "Survey submitted successfully");
  },

  async getMySubmissions(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Employee id is required");
    }

    const result = await surveyService.getMySubmissions(req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },
};
