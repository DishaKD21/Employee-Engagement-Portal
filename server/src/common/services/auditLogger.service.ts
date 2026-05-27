import { prisma } from "../../config/db.js";
import { logger } from "../../config/logger.js";

export type AuditEventInput = {
  eventType: string;
  employeeId?: number;
  contentId?: number;
  channel?: string;
  outcome?: string;
  reviewerDecision?: string;
};

function normalizePositiveInteger(value?: number) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
}

function normalizeText(value: string | undefined, maxLength: number) {
  const normalized = value?.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, maxLength);
}

export const auditLogger = {
  async logAuditEvent(input: AuditEventInput) {
    const eventType = normalizeText(input.eventType, 100);

    if (!eventType) {
      logger.error("[audit-logger] audit failed", {
        reason: "invalid eventType",
        input,
      });
      return;
    }

    const employeeId = normalizePositiveInteger(input.employeeId);
    const contentId = normalizePositiveInteger(input.contentId);
    const channel = normalizeText(input.channel, 50);
    const outcome = normalizeText(input.outcome, 100);
    const reviewerDecision = normalizeText(input.reviewerDecision, 50);

    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          eventType,
          employeeId,
          contentId,
          channel,
          outcome,
          reviewerDecision,
        },
      });

      logger.info("[audit-logger] audit inserted", {
        logId: auditLog.logId,
        eventType: auditLog.eventType,
        employeeId: auditLog.employeeId,
        contentId: auditLog.contentId,
        channel: auditLog.channel,
        outcome: auditLog.outcome,
        reviewerDecision: auditLog.reviewerDecision,
      });
    } catch (error) {
      logger.error("[audit-logger] audit failed", {
        eventType,
        employeeId,
        contentId,
        channel,
        outcome,
        reviewerDecision,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};