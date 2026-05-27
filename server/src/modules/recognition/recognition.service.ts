import { ApprovalStatus, ContentType, DeliveryStatus, EventType, NotificationChannel, NotificationStatus, NotificationType } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { auditLogger } from "../../common/services/auditLogger.service.js";
import { logger } from "../../config/logger.js";
import { personalizeTemplate } from "../../common/utils/templatePersonalizer.js";
import { sendMail } from "../../utils/sendMail.js";
import type {
  RecognitionApprovalRecord,
  RecognitionDeliveryRecord,
  RecognitionEventRecord,
  RecognitionEventType,
  RecognitionNotificationRecord,
  RecognitionTemplateRecord,
} from "./recognition.types.js";
import type { CreateRecognitionTemplateInput, RejectRecognitionTemplateInput, UpdateRecognitionTemplateInput } from "./recognition.validation.js";

type EmployeeCandidate = {
  employeeId: number;
  name: string;
  email: string;
  dateOfBirth: Date;
  joiningDate: Date;
};

type RecognitionTemplateRow = {
  templateId: number;
  templateName: string | null;
  eventType: EventType | null;
  content: string | null;
  version: number | null;
  isActive: boolean | null;
  createdBy: number | null;
  approvedStatus: ApprovalStatus | null;
  createdAt: Date;
};

type RecognitionEventRow = {
  eventId: number;
  employeeId: number | null;
  eventType: EventType | null;
  triggerDate: Date | null;
  templateId: number | null;
  deliveryStatus: DeliveryStatus | null;
  createdAt: Date;
  employee: { employeeId: number; name: string; email: string } | null;
  template: RecognitionTemplateRow | null;
  deliveryLogs: Array<{
    id: number;
    eventId: number | null;
    channel: NotificationChannel | null;
    deliveryStatus: string | null;
    retryCount: number | null;
    deliveredAt: Date | null;
  }>;
};

type RecognitionApprovalRow = {
  approvalId: number;
  status: ApprovalStatus | null;
  comments: string | null;
  createdAt: Date;
  template: RecognitionTemplateRow | null;
};

const MAX_DELIVERY_ATTEMPTS = 3;

function normalizeRecognitionEventType(eventType: string | null | undefined): EventType {
  const normalized = eventType?.trim().toUpperCase();

  if (normalized === "BIRTHDAY") {
    return EventType.birthday;
  }

  if (normalized === "WORK_ANNIVERSARY" || normalized === "ANNIVERSARY") {
    return EventType.anniversary;
  }

  throw new ApiError(400, "Invalid recognition event type");
}

function toRecognitionEventType(eventType: EventType | null | undefined): RecognitionEventType | null {
  if (eventType === EventType.birthday) {
    return "BIRTHDAY";
  }

  if (eventType === EventType.anniversary) {
    return "WORK_ANNIVERSARY";
  }

  return null;
}

function toRecognitionTemplateRecord(template: RecognitionTemplateRow): RecognitionTemplateRecord {
  return {
    templateId: template.templateId,
    templateName: template.templateName,
    eventType: toRecognitionEventType(template.eventType),
    content: template.content,
    version: template.version,
    isActive: template.isActive,
    createdBy: template.createdBy,
    approvedStatus: template.approvedStatus,
    createdAt: template.createdAt.toISOString(),
  };
}

function toRecognitionDeliveryRecord(delivery: RecognitionEventRow["deliveryLogs"][number]): RecognitionDeliveryRecord {
  return {
    id: delivery.id,
    eventId: delivery.eventId,
    channel: delivery.channel,
    deliveryStatus: delivery.deliveryStatus,
    retryCount: delivery.retryCount,
    deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
  };
}

function toRecognitionEventRecord(event: RecognitionEventRow): RecognitionEventRecord {
  return {
    eventId: event.eventId,
    employeeId: event.employeeId,
    employeeName: event.employee?.name ?? null,
    employeeEmail: event.employee?.email ?? null,
    eventType: toRecognitionEventType(event.eventType),
    triggerDate: event.triggerDate?.toISOString() ?? null,
    templateId: event.templateId,
    deliveryStatus: event.deliveryStatus,
    createdAt: event.createdAt.toISOString(),
    template: event.template ? toRecognitionTemplateRecord(event.template) : null,
    deliveryLogs: event.deliveryLogs.map(toRecognitionDeliveryRecord),
  };
}

function toRecognitionApprovalRecord(approval: RecognitionApprovalRow): RecognitionApprovalRecord {
  return {
    approvalId: approval.approvalId,
    status: approval.status,
    comments: approval.comments,
    createdAt: approval.createdAt.toISOString(),
    template: approval.template ? toRecognitionTemplateRecord(approval.template) : null,
  };
}

function mapTemplateInput(input: CreateRecognitionTemplateInput | UpdateRecognitionTemplateInput) {
  return {
    templateName: input.template_name?.trim(),
    eventType: input.event_type ? normalizeRecognitionEventType(input.event_type) : undefined,
    content: input.content?.trim(),
  };
}

function getYearsCompleted(joiningDate: Date, now: Date) {
  return Math.max(0, now.getFullYear() - joiningDate.getFullYear());
}

function normalizeDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateKey(date: Date) {
  return `${date.getMonth() + 1}-${date.getDate()}`;
}

function isSameCalendarDay(firstDate: Date, secondDate: Date) {
  return getDateKey(firstDate) === getDateKey(secondDate);
}

async function getActiveTemplateByEventType(eventType: EventType) {
  return prisma.recognitionTemplate.findFirst({
    where: {
      eventType,
      isActive: true,
      approvedStatus: ApprovalStatus.approved,
    },
    orderBy: [{ version: "desc" }, { createdAt: "desc" }],
  });
}

async function getNotificationDelivery(eventId: number) {
  return prisma.notificationDelivery.findFirst({
    where: { eventId, channel: NotificationChannel.email },
    orderBy: { deliveredAt: "desc" },
  });
}

async function ensureNotificationRecord(params: {
  employeeId: number;
  eventId: number;
  title: string;
  message: string;
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      employeeId: params.employeeId,
      relatedId: params.eventId,
      relatedType: "RECOGNITION_EVENT",
      channel: NotificationChannel.email,
      notificationType: NotificationType.recognition,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.notification.create({
    data: {
      employeeId: params.employeeId,
      title: params.title,
      message: params.message,
      notificationType: NotificationType.recognition,
      relatedId: params.eventId,
      relatedType: "RECOGNITION_EVENT",
      channel: NotificationChannel.email,
      status: NotificationStatus.pending,
      retryCount: 0,
    },
  });
}

async function saveDeliveryLog(params: {
  eventId: number;
  deliveryStatus: DeliveryStatus;
  retryCount: number;
  deliveredAt?: Date | null;
}) {
  const existing = await getNotificationDelivery(params.eventId);

  if (existing) {
    return prisma.notificationDelivery.update({
      where: { id: existing.id },
      data: {
        deliveryStatus: params.deliveryStatus,
        retryCount: params.retryCount,
        deliveredAt: params.deliveredAt ?? existing.deliveredAt ?? null,
      },
    });
  }

  return prisma.notificationDelivery.create({
    data: {
      eventId: params.eventId,
      channel: NotificationChannel.email,
      deliveryStatus: params.deliveryStatus,
      retryCount: params.retryCount,
      deliveredAt: params.deliveredAt ?? null,
    },
  });
}

async function deliverRecognitionMessage(params: {
  employee: EmployeeCandidate;
  eventId: number;
  title: string;
  message: string;
}) {
  const notification = await ensureNotificationRecord({
    employeeId: params.employee.employeeId,
    eventId: params.eventId,
    title: params.title,
    message: params.message,
  });

  if (notification.status === NotificationStatus.sent) {
    return { notification, delivery: await getNotificationDelivery(params.eventId) };
  }

  let lastError: unknown = null;
  const existingDelivery = await getNotificationDelivery(params.eventId);
  const initialRetryCount = existingDelivery?.retryCount ?? 0;

  for (let attempt = initialRetryCount + 1; attempt <= MAX_DELIVERY_ATTEMPTS; attempt += 1) {
    try {
      await sendMail({
        to: params.employee.email,
        subject: params.title,
        text: params.message,
        html: `<p>${params.message.replace(/\n/g, "<br />")}</p>`,
      });

      await prisma.notification.update({
        where: { notificationId: notification.notificationId },
        data: {
          status: NotificationStatus.sent,
          sentAt: new Date(),
          retryCount: attempt,
        },
      });

      const delivery = await saveDeliveryLog({
        eventId: params.eventId,
        deliveryStatus: DeliveryStatus.success,
        retryCount: attempt,
        deliveredAt: new Date(),
      });

      await auditLogger.logAuditEvent({
        eventType: "Recognition Delivered",
        employeeId: params.employee.employeeId,
        contentId: params.eventId,
        channel: "EMAIL",
        outcome: "Delivered",
      });

      return { notification: await prisma.notification.findUnique({ where: { notificationId: notification.notificationId } }), delivery };
    } catch (error) {
      lastError = error;

      if (attempt < MAX_DELIVERY_ATTEMPTS) {
        await prisma.notification.update({
          where: { notificationId: notification.notificationId },
          data: {
            status: NotificationStatus.pending,
            retryCount: attempt,
          },
        });

        await saveDeliveryLog({
          eventId: params.eventId,
          deliveryStatus: DeliveryStatus.pending,
          retryCount: attempt,
          deliveredAt: null,
        });

        continue;
      }

      await prisma.notification.update({
        where: { notificationId: notification.notificationId },
        data: {
          status: NotificationStatus.failed,
          retryCount: attempt,
        },
      });

      const delivery = await saveDeliveryLog({
        eventId: params.eventId,
        deliveryStatus: DeliveryStatus.failed,
        retryCount: attempt,
        deliveredAt: new Date(),
      });

      await auditLogger.logAuditEvent({
        eventType: "Recognition Delivery Failed",
        employeeId: params.employee.employeeId,
        contentId: params.eventId,
        channel: "EMAIL",
        outcome: "Failed",
      });

      return { notification: await prisma.notification.findUnique({ where: { notificationId: notification.notificationId } }), delivery, lastError };
    }
  }

  return { notification, delivery: await getNotificationDelivery(params.eventId), lastError };
}

async function createRecognitionEntryForEmployee(params: {
  employee: EmployeeCandidate;
  eventType: EventType;
  triggerDate: Date;
}) {
  const template = await getActiveTemplateByEventType(params.eventType);

  if (!template || !template.content) {
    return null;
  }

  const existingEvent = await prisma.recognitionEvent.findFirst({
    where: {
      employeeId: params.employee.employeeId,
      eventType: params.eventType,
      triggerDate: params.triggerDate,
    },
  });

  const event = existingEvent
    ? existingEvent
    : await prisma.recognitionEvent.create({
        data: {
          employeeId: params.employee.employeeId,
          eventType: params.eventType,
          triggerDate: normalizeDateOnly(params.triggerDate),
          templateId: template.templateId,
          deliveryStatus: "pending",
        },
      });

  const personalizedMessage = personalizeTemplate(template.content, {
    name: params.employee.name,
    employee_name: params.employee.name,
    years: getYearsCompleted(params.employee.joiningDate, params.triggerDate),
    employee_id: params.employee.employeeId,
    email: params.employee.email,
  });

  const title = params.eventType === EventType.birthday ? `Happy Birthday ${params.employee.name}` : `Work Anniversary ${params.employee.name}`;

  const deliveryResult = await deliverRecognitionMessage({
    employee: params.employee,
    eventId: event.eventId,
    title,
    message: personalizedMessage,
  });

  await prisma.recognitionEvent.update({
    where: { eventId: event.eventId },
    data: {
      templateId: template.templateId,
      deliveryStatus: deliveryResult.notification?.status === NotificationStatus.sent ? "success" : "failed",
    },
  });

  return prisma.recognitionEvent.findUnique({
    where: { eventId: event.eventId },
    include: {
      employee: {
        select: {
          employeeId: true,
          name: true,
          email: true,
        },
      },
      template: true,
      deliveryLogs: true,
    },
  });
}

async function buildEmployeeEventResults(eventType: EventType) {
  const employees = await prisma.employee.findMany({
    select: {
      employeeId: true,
      name: true,
      email: true,
      dateOfBirth: true,
      joiningDate: true,
    },
  });

  const today = new Date();

  const matchingEmployees = employees.filter((employee) =>
    eventType === EventType.birthday
      ? isSameCalendarDay(employee.dateOfBirth, today)
      : isSameCalendarDay(employee.joiningDate, today),
  );

  const results = [] as Array<ReturnType<typeof createRecognitionEntryForEmployee>>;

  for (const employee of matchingEmployees) {
    results.push(createRecognitionEntryForEmployee({ employee, eventType, triggerDate: today }));
  }

  return Promise.all(results);
}

export const recognitionService = {
  async getTemplates() {
    const templates = await prisma.recognitionTemplate.findMany({
      orderBy: [{ createdAt: "desc" }, { version: "desc" }],
    });

    return templates.map((template) => toRecognitionTemplateRecord(template as RecognitionTemplateRow));
  },

  async createTemplate(input: CreateRecognitionTemplateInput, createdBy: number) {
    const mapped = mapTemplateInput(input);

    logger.info("[recognition-template:create] service input", {
      input,
      createdBy,
    });

    const created = await prisma.$transaction(async (tx) => {
      const template = await tx.recognitionTemplate.create({
        data: {
          templateName: mapped.templateName,
          eventType: mapped.eventType,
          content: mapped.content,
          version: 1,
          isActive: false,
          createdBy,
          approvedStatus: ApprovalStatus.pending,
        },
      });

      logger.info("[recognition-template:create] prisma template created", template);

      const approval = await tx.approval.create({
        data: {
          contentType: ContentType.template,
          contentId: template.templateId,
          status: ApprovalStatus.pending,
        },
      });

      logger.info("[recognition-template:create] prisma approval created", approval);

      return { template, approval };
    });

    const response = {
      ...toRecognitionTemplateRecord(created.template as RecognitionTemplateRow),
      approvalId: created.approval.approvalId,
    };

    logger.info("[recognition-template:create] service response", response);

    return response;
  },

  async updateTemplate(templateId: number, createdBy: number, input: UpdateRecognitionTemplateInput) {
    const existingTemplate = await prisma.recognitionTemplate.findUnique({ where: { templateId } });

    if (!existingTemplate) {
      throw new ApiError(404, "Template not found");
    }

    if (existingTemplate.createdBy !== createdBy) {
      throw new ApiError(403, "Forbidden");
    }

    if (existingTemplate.approvedStatus !== ApprovalStatus.pending) {
      throw new ApiError(400, "Only pending templates can be updated");
    }

    const mapped = mapTemplateInput(input);

    const updated = await prisma.$transaction(async (tx) => {
      const template = await tx.recognitionTemplate.update({
        where: { templateId },
        data: {
          templateName: mapped.templateName ?? existingTemplate.templateName,
          eventType: mapped.eventType ?? existingTemplate.eventType,
          content: mapped.content ?? existingTemplate.content,
          version: (existingTemplate.version ?? 0) + 1,
          approvedStatus: ApprovalStatus.pending,
          isActive: false,
        },
      });

      await tx.approval.deleteMany({
        where: {
          contentType: ContentType.template,
          contentId: templateId,
        },
      });

      const approval = await tx.approval.create({
        data: {
          contentType: ContentType.template,
          contentId: templateId,
          status: ApprovalStatus.pending,
        },
      });

      return { template, approval };
    });

    return {
      ...toRecognitionTemplateRecord(updated.template as RecognitionTemplateRow),
      approvalId: updated.approval.approvalId,
    };
  },

  async deleteTemplate(templateId: number, createdBy: number) {
    const existingTemplate = await prisma.recognitionTemplate.findUnique({ where: { templateId } });

    if (!existingTemplate) {
      throw new ApiError(404, "Template not found");
    }

    if (existingTemplate.createdBy !== createdBy) {
      throw new ApiError(403, "Forbidden");
    }

    if (existingTemplate.approvedStatus !== ApprovalStatus.pending) {
      throw new ApiError(400, "Only pending templates can be deleted");
    }

    await prisma.$transaction([
      prisma.approval.deleteMany({
        where: {
          contentType: ContentType.template,
          contentId: templateId,
        },
      }),
      prisma.recognitionTemplate.delete({ where: { templateId } }),
    ]);

    return { deleted: true };
  },

  async getTemplateApprovals() {
    const approvals = await prisma.approval.findMany({
      where: {
        contentType: ContentType.template,
        status: ApprovalStatus.pending,
      },
      orderBy: { createdAt: "asc" },
    });

    const templates = await prisma.recognitionTemplate.findMany({
      where: {
        templateId: {
          in: approvals.map((approval) => approval.contentId).filter((value): value is number => value !== null),
        },
      },
    });

    const templateById = new Map(templates.map((template) => [template.templateId, template as RecognitionTemplateRow]));

    return approvals
      .filter((approval) => approval.contentId !== null)
      .map((approval) =>
        toRecognitionApprovalRecord({
          approvalId: approval.approvalId,
          status: approval.status,
          comments: approval.comments,
          createdAt: approval.createdAt,
          template: templateById.get(approval.contentId as number) ?? null,
        }),
      );
  },

  async approveTemplate(approvalId: number, reviewerEmployeeId: number) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval || approval.contentType !== ContentType.template || approval.contentId === null) {
      throw new ApiError(404, "Approval not found");
    }

    const template = await prisma.recognitionTemplate.findUnique({ where: { templateId: approval.contentId } });

    if (!template) {
      throw new ApiError(404, "Template not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { approvalId },
        data: {
          status: ApprovalStatus.approved,
          reviewerId: reviewerEmployeeId,
        },
      });

      await tx.recognitionTemplate.updateMany({
        where: {
          templateId: { not: template.templateId },
          eventType: template.eventType,
        },
        data: {
          isActive: false,
        },
      });

      const updatedTemplate = await tx.recognitionTemplate.update({
        where: { templateId: template.templateId },
        data: {
          isActive: true,
          approvedStatus: ApprovalStatus.approved,
        },
      });

      return { updatedApproval, updatedTemplate };
    });

    await auditLogger.logAuditEvent({
      eventType: "Recognition Approved",
      employeeId: reviewerEmployeeId,
      contentId: template.templateId,
      channel: "RECOGNITION",
      outcome: "Approved",
      reviewerDecision: "Approved",
    });

    return {
      approvalId: updated.updatedApproval.approvalId,
      status: updated.updatedApproval.status,
      template: toRecognitionTemplateRecord(updated.updatedTemplate as RecognitionTemplateRow),
    };
  },

  async rejectTemplate(approvalId: number, reviewerEmployeeId: number, input?: RejectRecognitionTemplateInput) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval || approval.contentType !== ContentType.template || approval.contentId === null) {
      throw new ApiError(404, "Approval not found");
    }

    if (approval.status !== ApprovalStatus.pending) {
      throw new ApiError(400, "Approval is already processed");
    }

    const template = await prisma.recognitionTemplate.findUnique({ where: { templateId: approval.contentId } });

    if (!template) {
      throw new ApiError(404, "Template not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { approvalId },
        data: {
          status: ApprovalStatus.rejected,
          reviewerId: reviewerEmployeeId,
          comments: input?.comments?.trim() || approval.comments,
        },
      });

      const updatedTemplate = await tx.recognitionTemplate.update({
        where: { templateId: template.templateId },
        data: {
          isActive: false,
          approvedStatus: ApprovalStatus.rejected,
        },
      });

      return { updatedApproval, updatedTemplate };
    });

    await auditLogger.logAuditEvent({
      eventType: "Recognition Rejected",
      employeeId: reviewerEmployeeId,
      contentId: template.templateId,
      channel: "RECOGNITION",
      outcome: "Rejected",
      reviewerDecision: "Rejected",
    });

    return {
      approvalId: updated.updatedApproval.approvalId,
      status: updated.updatedApproval.status,
      template: toRecognitionTemplateRecord(updated.updatedTemplate as RecognitionTemplateRow),
    };
  },

  async getRecognitionEvents() {
    const events = await prisma.recognitionEvent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          select: {
            employeeId: true,
            name: true,
            email: true,
          },
        },
        template: true,
        deliveryLogs: {
          orderBy: { deliveredAt: "desc" },
        },
      },
    });

    return events.map((event) => toRecognitionEventRecord(event as RecognitionEventRow));
  },

  async runDailyRecognitionChecks() {
    const today = normalizeDateOnly(new Date());
    const birthdayResults = await buildEmployeeEventResults(EventType.birthday);
    const anniversaryResults = await buildEmployeeEventResults(EventType.anniversary);

    return {
      runDate: today.toISOString(),
      birthdaysCreated: birthdayResults.filter(Boolean).length,
      anniversariesCreated: anniversaryResults.filter(Boolean).length,
    };
  },

  async getEmployeeNotifications(employeeId: number) {
    const notifications = await prisma.notification.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });

    const eventIds = notifications.map((notification) => notification.relatedId).filter((value): value is number => value !== null);

    const deliveries = eventIds.length
      ? await prisma.notificationDelivery.findMany({
          where: { eventId: { in: eventIds } },
          orderBy: { deliveredAt: "desc" },
        })
      : [];

    const deliveryByEventId = new Map<number, (typeof deliveries)[number]>();

    for (const delivery of deliveries) {
      if (delivery.eventId !== null && !deliveryByEventId.has(delivery.eventId)) {
        deliveryByEventId.set(delivery.eventId, delivery);
      }
    }

    return notifications.map((notification) => ({
      notificationId: notification.notificationId,
      employeeId: notification.employeeId,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notificationType,
      relatedId: notification.relatedId,
      relatedType: notification.relatedType,
      channel: notification.channel,
      status: notification.status,
      retryCount: notification.retryCount,
      sentAt: notification.sentAt?.toISOString() ?? null,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
      delivery: notification.relatedId ? deliveryByEventId.get(notification.relatedId) ?? null : null,
    })) as RecognitionNotificationRecord[];
  },
};