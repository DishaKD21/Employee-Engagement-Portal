import axios from "axios";
import { NotificationChannel, NotificationStatus, NotificationType, QueryStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { auditLogger } from "../../common/services/auditLogger.service.js";
import { logger } from "../../config/logger.js";

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: env.AI_SERVICE_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

const escalationInclude = {
  query: {
    include: {
      employee: {
        select: {
          employeeId: true,
          name: true,
          email: true,
          department: true,
        },
      },
    },
  },
} as const;

async function notifyEmployeeResolved(escalationId: number, employeeId?: number | null) {
  if (!employeeId) {
    return;
  }

  await prisma.notification.create({
    data: {
      employeeId,
      title: "HR answered your query",
      message: "Your escalated HR query has been resolved.",
      notificationType: NotificationType.query_response,
      relatedId: escalationId,
      relatedType: "query_escalation",
      channel: NotificationChannel.intranet,
      status: NotificationStatus.sent,
      sentAt: new Date(),
    },
  });
}

async function indexResolvedAnswer(escalationId: number, queryText: string, resolutionText: string, hrEmployeeId?: number) {
  const payload = {
    article_id: -1000 - escalationId,
    title: "Resolved Employee Query",
    content: `Question: ${queryText}\nAnswer: ${resolutionText}`,
    category: "HR_ESCALATION_KNOWLEDGE",
    role_tag: "EMPLOYEE",
    version: 1,
    status: "PUBLISHED",
  };

  try {
    const response = await aiClient.post("/rag/index-article", payload);
    await auditLogger.logAuditEvent({
      eventType: "HR Answer Indexed Into RAG",
      employeeId: hrEmployeeId,
      contentId: escalationId,
      channel: "RAG",
      outcome: `Indexed synthetic article ${payload.article_id}`,
      reviewerDecision: "Indexed",
    });
    logger.info("Indexed resolved escalation answer into RAG", {
      escalationId,
      articleId: payload.article_id,
      status: response.status,
    });
    return response.data;
  } catch (error) {
    logger.error(`Failed to index resolved escalation ${escalationId}: ${error instanceof Error ? error.message : String(error)}`);
    throw new ApiError(502, "AI service indexing failed");
  }
}

export const queryEscalationService = {
  async listEscalations() {
    return prisma.queryEscalation.findMany({
      where: { status: QueryStatus.open },
      orderBy: { id: "desc" },
      include: escalationInclude,
    });
  },

  async listAllForHr() {
    return prisma.queryEscalation.findMany({
      orderBy: { id: "desc" },
      include: escalationInclude,
    });
  },

  async getEscalation(id: number) {
    const escalation = await prisma.queryEscalation.findUnique({
      where: { id },
      include: escalationInclude,
    });

    if (!escalation) {
      throw new ApiError(404, "Escalation not found");
    }

    return escalation;
  },

  async listMyEscalations(employeeId: number) {
    return prisma.queryEscalation.findMany({
      where: {
        query: { employeeId },
      },
      orderBy: { id: "desc" },
      include: escalationInclude,
    });
  },

  async resolveEscalation(id: number, resolutionText: string, hrEmployeeId?: number) {
    const escalation = await prisma.queryEscalation.findUnique({
      where: { id },
      include: { query: true },
    });

    if (!escalation || !escalation.query) {
      throw new ApiError(404, "Escalation not found");
    }

    if (escalation.status === QueryStatus.resolved) {
      throw new ApiError(400, "Escalation is already resolved");
    }

    const updated = await prisma.queryEscalation.update({
      where: { id },
      data: {
        status: QueryStatus.resolved,
        resolutionText,
        assignedTo: hrEmployeeId ?? escalation.assignedTo,
        resolvedAt: new Date(),
      },
      include: escalationInclude,
    });

    await auditLogger.logAuditEvent({
      eventType: "Escalation Resolved",
      employeeId: hrEmployeeId,
      contentId: id,
      channel: "QUERY_ESCALATION",
      outcome: "Resolved",
      reviewerDecision: "Resolved",
    });

    await notifyEmployeeResolved(id, escalation.query.employeeId);
    await indexResolvedAnswer(id, escalation.query.queryText ?? "", resolutionText, hrEmployeeId);

    return updated;
  },
};
