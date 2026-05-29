import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { queryEscalationService } from "./query-escalation.service.js";

function parseEscalationId(value: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid escalation id");
  }

  return parsed;
}

export const queryEscalationController = {
  async listEscalations(_req: Request, res: Response) {
    const result = await queryEscalationService.listEscalations();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async resolveEscalation(req: Request, res: Response) {
    const escalationId = parseEscalationId(req.params.id);
    const result = await queryEscalationService.resolveEscalation(
      escalationId,
      req.body.resolutionText,
      req.body.assignedTo,
    );

    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },
};