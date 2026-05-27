import { ApprovalStatus, ContentType, EventStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { auditLogger } from "../../common/services/auditLogger.service.js";

async function loadPendingEventApprovals() {
  const approvals = await prisma.approval.findMany({
    where: {
      contentType: ContentType.event,
      status: ApprovalStatus.pending,
    },
    orderBy: { createdAt: "asc" },
  });

  const events = await prisma.engagementEvent.findMany({
    where: {
      eventId: {
        in: approvals.map((approval) => approval.contentId).filter((value): value is number => value !== null),
      },
    },
    include: {
      creator: {
        select: {
          employeeId: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const eventById = new Map(events.map((event) => [event.eventId, event]));

  return approvals
    .filter((approval) => approval.contentId !== null)
    .map((approval) => ({
      approvalId: approval.approvalId,
      status: approval.status,
      comments: approval.comments,
      createdAt: approval.createdAt,
      event: eventById.get(approval.contentId as number) ?? null,
    }));
}

export const approvalService = {
  async getPendingApprovals() {
    return loadPendingEventApprovals();
  },

  async approveEvent(approvalId: number, reviewerEmployeeId: number) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval || approval.contentType !== ContentType.event || approval.contentId === null) {
      throw new ApiError(404, "Approval not found");
    }

    const event = await prisma.engagementEvent.findUnique({ where: { eventId: approval.contentId } });

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { approvalId },
        data: {
          status: ApprovalStatus.approved,
          reviewerId: reviewerEmployeeId,
        },
      });

      const updatedEvent = await tx.engagementEvent.update({
        where: { eventId: event.eventId },
        data: {
          status: EventStatus.published,
          approvedStatus: ApprovalStatus.approved,
          publishedDate: new Date(),
        },
        include: {
          creator: {
            select: {
              employeeId: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { updatedApproval, updatedEvent };
    });

    await auditLogger.logAuditEvent({
      eventType: "Event Approved",
      employeeId: reviewerEmployeeId,
      contentId: event.eventId,
      channel: "EVENT",
      outcome: "Approved",
      reviewerDecision: "Approved",
    });

    return {
      approvalId: result.updatedApproval.approvalId,
      status: result.updatedApproval.status,
      event: result.updatedEvent,
    };
  },

  async rejectEvent(approvalId: number, reviewerEmployeeId: number, comments?: string) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval || approval.contentType !== ContentType.event || approval.contentId === null) {
      throw new ApiError(404, "Approval not found");
    }

    if (approval.status !== ApprovalStatus.pending) {
      throw new ApiError(400, "Approval is already processed");
    }

    const event = await prisma.engagementEvent.findUnique({ where: { eventId: approval.contentId } });

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { approvalId },
        data: {
          status: ApprovalStatus.rejected,
          reviewerId: reviewerEmployeeId,
          comments: comments?.trim() || approval.comments,
        },
      });

      const updatedEvent = await tx.engagementEvent.update({
        where: { eventId: event.eventId },
        data: {
          status: EventStatus.draft,
          approvedStatus: ApprovalStatus.rejected,
          publishedDate: null,
        },
        include: {
          creator: {
            select: {
              employeeId: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { updatedApproval, updatedEvent };
    });

    await auditLogger.logAuditEvent({
      eventType: "Event Rejected",
      employeeId: reviewerEmployeeId,
      contentId: event.eventId,
      channel: "EVENT",
      outcome: "Rejected",
      reviewerDecision: "Rejected",
    });

    return {
      approvalId: result.updatedApproval.approvalId,
      status: result.updatedApproval.status,
      event: result.updatedEvent,
    };
  },
};