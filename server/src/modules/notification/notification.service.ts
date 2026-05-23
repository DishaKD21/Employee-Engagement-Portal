import { prisma } from "../../config/db.js";

export const notificationService = {
  async listForEmployee(employeeId: number) {
    return prisma.notification.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  },
  async markRead(notificationId: number, employeeId: number) {
    return prisma.notification.updateMany({ where: { notificationId, employeeId }, data: { readAt: new Date() } });
  },
  async sendNotification(data: { employeeId?: number; title?: string; message?: string; relatedId?: number; relatedType?: string; channel?: any }) {
    return prisma.notification.create({ data });
  },
};