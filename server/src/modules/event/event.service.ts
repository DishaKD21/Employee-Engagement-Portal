import { ApprovalStatus, ContentType, EventStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import type { CreateEventInput, UpdateEventInput } from "./event.types.js";

function parseDate(date: Date | string | null | undefined) {
  if (!date) return null;
  return date instanceof Date ? date : new Date(date);
}

function ensureValidId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid id");
  }
}

async function getEventOrThrow(eventId: number) {
  const event = await prisma.engagementEvent.findUnique({
    where: { eventId },
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

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return event;
}

async function getApprovalForEvent(eventId: number) {
  return prisma.approval.findFirst({
    where: {
      contentType: ContentType.event,
      contentId: eventId,
    },
  });
}

function isPublished(event: { status: EventStatus | null; approvedStatus: ApprovalStatus | null }) {
  return event.status === EventStatus.published && event.approvedStatus === ApprovalStatus.approved;
}

export const eventService = {
  async createEvent(input: CreateEventInput, creatorEmployeeId: number) {
    const created = await prisma.$transaction(async (tx) => {
      const event = await tx.engagementEvent.create({
        data: {
          eventName: input.event_name.trim(),
          eventType: input.event_type.trim(),
          description: input.description?.trim() || null,
          targetAudience: input.target_audience.trim(),
          registrationStart: input.registration_start,
          registrationEnd: input.registration_end,
          eventDate: input.event_date,
          status: EventStatus.draft,
          approvedStatus: ApprovalStatus.pending,
          createdBy: creatorEmployeeId,
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

      const approval = await tx.approval.create({
        data: {
          contentType: ContentType.event,
          contentId: event.eventId,
          status: ApprovalStatus.pending,
        },
      });

      return { event, approval };
    });

    return {
      ...created.event,
      approvalId: created.approval.approvalId,
    };
  },

  async getMyEvents(creatorEmployeeId: number) {
    const events = await prisma.engagementEvent.findMany({
      where: { createdBy: creatorEmployeeId },
      orderBy: { eventId: "desc" },
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

    const approvals = await prisma.approval.findMany({
      where: {
        contentType: ContentType.event,
        contentId: { in: events.map((event) => event.eventId) },
      },
    });

    const approvalByContentId = new Map(approvals.map((approval) => [approval.contentId ?? 0, approval]));

    return events.map((event) => ({
      ...event,
      approvalId: approvalByContentId.get(event.eventId)?.approvalId ?? null,
      workflowStatus: approvalByContentId.get(event.eventId)?.status ?? event.approvedStatus,
    }));
  },

  async updateEvent(eventId: number, creatorEmployeeId: number, input: UpdateEventInput) {
    ensureValidId(eventId);

    const event = await getEventOrThrow(eventId);

    if (event.createdBy !== creatorEmployeeId) {
      throw new ApiError(403, "Forbidden");
    }

    if (event.approvedStatus !== ApprovalStatus.pending) {
      throw new ApiError(400, "Only non-approved events can be updated");
    }

    const updated = await prisma.engagementEvent.update({
      where: { eventId },
      data: {
        eventName: input.event_name?.trim() ?? undefined,
        eventType: input.event_type?.trim() ?? undefined,
        description: input.description !== undefined ? input.description?.trim() || null : undefined,
        targetAudience: input.target_audience?.trim() ?? undefined,
        registrationStart: input.registration_start,
        registrationEnd: input.registration_end,
        eventDate: input.event_date,
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

    return updated;
  },

  async deleteEvent(eventId: number, creatorEmployeeId: number) {
    ensureValidId(eventId);

    const event = await getEventOrThrow(eventId);

    if (event.createdBy !== creatorEmployeeId) {
      throw new ApiError(403, "Forbidden");
    }

    if (event.approvedStatus !== ApprovalStatus.pending) {
      throw new ApiError(400, "Only non-approved events can be deleted");
    }

    await prisma.$transaction([
      prisma.approval.deleteMany({
        where: {
          contentType: ContentType.event,
          contentId: eventId,
        },
      }),
      prisma.engagementEvent.delete({ where: { eventId } }),
    ]);

    return { deleted: true };
  },

  async getPublishedEvents() {
    const events = await prisma.engagementEvent.findMany({
      where: {
        status: EventStatus.published,
        approvedStatus: ApprovalStatus.approved,
      },
      orderBy: { publishedDate: "desc" },
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

    return events;
  },

  async registerForEvent(eventId: number, employeeId: number) {
    ensureValidId(eventId);

    const event = await getEventOrThrow(eventId);

    if (!isPublished(event)) {
      throw new ApiError(400, "Only published events can be registered");
    }

    const now = new Date();
    const registrationStart = parseDate(event.registrationStart);
    const registrationEnd = parseDate(event.registrationEnd);

    if (registrationStart && now < registrationStart) {
      throw new ApiError(400, "Registration has not started yet");
    }

    if (registrationEnd && now > registrationEnd) {
      throw new ApiError(400, "Registration is closed");
    }

    const existing = await prisma.eventParticipant.findFirst({
      where: { eventId, employeeId },
    });

    if (existing) {
      throw new ApiError(409, "You are already registered for this event");
    }

    const registration = await prisma.eventParticipant.create({
      data: {
        eventId,
        employeeId,
        registrationStatus: true,
      },
      include: {
        event: {
          include: {
            creator: {
              select: {
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return registration;
  },

  async getMyRegistrations(employeeId: number) {
    const registrations = await prisma.eventParticipant.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          include: {
            creator: {
              select: {
                employeeId: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return registrations;
  },
};

export async function getEventApproval(eventId: number) {
  return getApprovalForEvent(eventId);
}export {};