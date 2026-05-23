import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";

export const approvalService = {
  listPending() {
    return prisma.approval.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" } });
  },
  async approve(approvalId: number, reviewerId: number, comments?: string) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval) {
      throw new ApiError(404, "Approval not found");
    }

    return prisma.approval.update({
      where: { approvalId },
      data: { status: "approved", reviewerId, comments },
    });
  },
  async reject(approvalId: number, reviewerId: number, comments?: string) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval) {
      throw new ApiError(404, "Approval not found");
    }

    return prisma.approval.update({
      where: { approvalId },
      data: { status: "rejected", reviewerId, comments },
    });
  },
};