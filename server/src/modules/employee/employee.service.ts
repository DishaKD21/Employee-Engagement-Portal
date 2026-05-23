import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import type { UpdateMeInput } from "./employee.types.js";

export const employeeService = {
  async getMe(employeeId: number) {
    const employee = await prisma.employee.findUnique({ where: { employeeId } });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    return employee;
  },

  async updateMe(employeeId: number, input: UpdateMeInput) {
    return prisma.employee.update({
      where: { employeeId },
      data: input,
    });
  },

  async listEvents(employeeId: number) {
    return prisma.engagementEvent.findMany({
      where: {
        OR: [{ targetAudience: null }, { targetAudience: { contains: "employee", mode: "insensitive" } }],
      },
      orderBy: { eventDate: "asc" },
      include: {
        participants: {
          where: { employeeId },
        },
      },
    });
  },

  async listSurveys(employeeId: number) {
    return prisma.survey.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        questions: true,
        responses: {
          where: { employeeId },
        },
      },
    });
  },

  async listNotifications(employeeId: number) {
    return prisma.notification.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  },
};