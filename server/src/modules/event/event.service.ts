import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import type { RegisterEventInput } from "./event.types.js";

export const eventService = {
  async getEvent(eventId: number, employeeId?: number) {
    const event = await prisma.engagementEvent.findUnique({
      where: { eventId },
      include: {
        participants: employeeId ? { where: { employeeId } } : true,
      },
    });

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    return event;
  },

  async registerForEvent(eventId: number, employeeId: number, input: RegisterEventInput) {
    return prisma.eventParticipant.upsert({
      where: {
        eventId_employeeId: {
          eventId,
          employeeId,
        },
      },
      update: {
        registrationStatus: true,
        participationStatus: "registered",
        feedbackRating: input.feedbackRating,
        feedbackText: input.feedbackText,
      },
      create: {
        eventId,
        employeeId,
        registrationStatus: true,
        participationStatus: "registered",
        feedbackRating: input.feedbackRating,
        feedbackText: input.feedbackText,
      },
    });
  },
};