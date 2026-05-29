import { QueryStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";

export const queryEscalationService = {
  async listEscalations() {
    return prisma.queryEscalation.findMany({
      orderBy: { id: "desc" },
      include: {
        query: true,
      },
    });
  },

  async resolveEscalation(id: number, resolutionText: string, assignedTo?: number) {
    const escalation = await prisma.queryEscalation.findUnique({ where: { id } });

    if (!escalation) {
      throw new ApiError(404, "Escalation not found");
    }

    return prisma.queryEscalation.update({
      where: { id },
      data: {
        status: QueryStatus.resolved,
        resolutionText,
        assignedTo: assignedTo ?? escalation.assignedTo,
        resolvedAt: new Date(),
      },
    });
  },
};