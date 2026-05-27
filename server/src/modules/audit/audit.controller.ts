import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { auditService } from "./audit.service.js";

function normalizeQueryValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  if (value === undefined) {
    return undefined;
  }

  throw new ApiError(400, "Invalid filter value");
}

function parseOptionalPositiveInteger(value: unknown) {
  const normalized = normalizeQueryValue(value);

  if (normalized === undefined) {
    return undefined;
  }

  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid filter value");
  }

  return parsed;
}

function parseOptionalText(value: unknown) {
  const normalized = normalizeQueryValue(value);

  if (normalized === undefined) {
    return undefined;
  }

  const trimmed = normalized.trim();

  return trimmed.length ? trimmed : undefined;
}

function parsePagination(value: unknown, fallback: number) {
  const normalized = normalizeQueryValue(value);

  if (normalized === undefined) {
    return fallback;
  }

  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ApiError(400, "Invalid pagination value");
  }

  return parsed;
}

function buildAuditFilters(query: Request["query"]) {
  return {
    skip: parsePagination(query.skip, 0),
    limit: parsePagination(query.limit, 100),
    search: parseOptionalText(query.search),
    eventType: parseOptionalText(query.event_type),
    employeeId: parseOptionalPositiveInteger(query.employee_id),
    contentId: parseOptionalPositiveInteger(query.content_id),
    channel: parseOptionalText(query.channel),
    outcome: parseOptionalText(query.outcome),
    reviewerDecision: parseOptionalText(query.reviewer_decision),
  };
}

export const auditController = {
  async getAuditLogs(req: Request, res: Response) {
    const result = await auditService.getAuditLogs(buildAuditFilters(req.query));
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async exportAuditLogs(req: Request, res: Response) {
    const result = await auditService.exportAuditLogs(buildAuditFilters(req.query));
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },
};export {};