import type { ApprovalStatus, EventStatus } from "@prisma/client";
import { z } from "zod";
import { createEventSchema, updateEventSchema, registerEventSchema } from "./event.validation.js";

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type RegisterEventInput = z.infer<typeof registerEventSchema>;

export type EventCreator = {
  employeeId: number;
  name: string;
  email: string;
};

export type EventRecord = {
  eventId: number;
  eventName: string | null;
  eventType: string | null;
  description: string | null;
  targetAudience: string | null;
  registrationStart: Date | null;
  registrationEnd: Date | null;
  eventDate: Date | null;
  publishedDate: Date | null;
  status: EventStatus | null;
  approvedStatus: ApprovalStatus | null;
  createdBy: number | null;
  creator?: EventCreator | null;
};

export type EventParticipantRecord = {
  id: number;
  eventId: number | null;
  employeeId: number | null;
  registrationStatus: boolean | null;
  participationStatus: string | null;
  feedbackRating: number | null;
  feedbackText: string | null;
  createdAt: Date;
  event?: EventRecord | null;
};

export type EventApprovalView = {
  approvalId: number;
  status: ApprovalStatus | null;
  comments: string | null;
  createdAt: Date;
  event: EventRecord;
  reviewer?: EventCreator | null;
};