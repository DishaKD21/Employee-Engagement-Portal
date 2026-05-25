import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { approvalService } from "./approval.service.js";

function getApprovalIdParam(value: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid approval id");
  }

  return parsed;
}

export const approvalController = {
  async getPendingApprovals(_req: Request, res: Response) {
    const result = await approvalService.getPendingApprovals();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async approveEvent(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Reviewer employee id is required");
    }

    const approvalId = getApprovalIdParam(req.params.id);
    const result = await approvalService.approveEvent(approvalId, req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async rejectEvent(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Reviewer employee id is required");
    }

    const approvalId = getApprovalIdParam(req.params.id);
    const result = await approvalService.rejectEvent(approvalId, req.user.employeeId, req.body?.comments);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },
};