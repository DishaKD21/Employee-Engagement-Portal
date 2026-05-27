import { prisma } from "../../config/db.js";

type AuditLogFilter = {
  skip?: number;
  limit?: number;
  search?: string;
  eventType?: string;
  employeeId?: number;
  contentId?: number;
  channel?: string;
  outcome?: string;
  reviewerDecision?: string;
};

function buildAuditWhere(filter: AuditLogFilter) {
  const trimmedSearch = filter.search?.trim();
  const numericSearch = trimmedSearch && /^\d+$/.test(trimmedSearch) ? Number(trimmedSearch) : undefined;

  return {
    ...(trimmedSearch
      ? {
          OR: [
            { eventType: { contains: trimmedSearch, mode: "insensitive" as const } },
            { channel: { contains: trimmedSearch, mode: "insensitive" as const } },
            { outcome: { contains: trimmedSearch, mode: "insensitive" as const } },
            { reviewerDecision: { contains: trimmedSearch, mode: "insensitive" as const } },
            ...(numericSearch ? [{ employeeId: numericSearch }, { contentId: numericSearch }] : []),
          ],
        }
      : {}),
    ...(filter.eventType ? { eventType: { contains: filter.eventType, mode: "insensitive" as const } } : {}),
    ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
    ...(filter.contentId ? { contentId: filter.contentId } : {}),
    ...(filter.channel ? { channel: { contains: filter.channel, mode: "insensitive" as const } } : {}),
    ...(filter.outcome ? { outcome: { contains: filter.outcome, mode: "insensitive" as const } } : {}),
    ...(filter.reviewerDecision ? { reviewerDecision: { contains: filter.reviewerDecision, mode: "insensitive" as const } } : {}),
  };
}

async function fetchAuditLogs(filter: AuditLogFilter) {
  const where = buildAuditWhere(filter);

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filter.skip,
      take: filter.limit,
      include: {
        employee: {
          select: {
            employeeId: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    items: logs.map((log) => ({
      logId: log.logId,
      eventType: log.eventType,
      employeeId: log.employeeId,
      contentId: log.contentId,
      channel: log.channel,
      outcome: log.outcome,
      reviewerDecision: log.reviewerDecision,
      createdAt: log.createdAt.toISOString(),
      employee: log.employee,
    })),
  };
}

export const auditService = {
  async getAuditLogs(filter: AuditLogFilter) {
    return fetchAuditLogs(filter);
  },

  async exportAuditLogs(filter: AuditLogFilter) {
    return fetchAuditLogs({ ...filter, skip: undefined, limit: undefined });
  },
};export {};