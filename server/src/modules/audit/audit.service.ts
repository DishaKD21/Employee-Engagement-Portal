import { prisma } from "../../config/db.js";

export const auditService = {
  listLogs() {
    return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
  },
};