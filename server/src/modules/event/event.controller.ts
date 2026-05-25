import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendCreated, sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { eventService } from "./event.service.js";

function getEventIdParam(value: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, "Invalid event id");
  }

  return parsed;
}

export const eventController = {
  async createEvent(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const result = await eventService.createEvent(req.body, req.user.employeeId);
    return sendCreated(res, result, MESSAGES.CREATED);
  },

  async getMyEvents(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const result = await eventService.getMyEvents(req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async updateEvent(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const eventId = getEventIdParam(req.params.id);
    const result = await eventService.updateEvent(eventId, req.user.employeeId, req.body);
    return sendSuccess(res, result, MESSAGES.UPDATED, 200);
  },

  async deleteEvent(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Creator employee id is required");
    }

    const eventId = getEventIdParam(req.params.id);
    const result = await eventService.deleteEvent(eventId, req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.DELETED, 200);
  },

  async getPublishedEvents(_req: Request, res: Response) {
    const result = await eventService.getPublishedEvents();
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },

  async registerForEvent(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Employee id is required");
    }

    const eventId = getEventIdParam(req.params.id);
    const result = await eventService.registerForEvent(eventId, req.user.employeeId);
    return sendCreated(res, result, "Registration successful");
  },

  async getMyRegistrations(req: Request, res: Response) {
    if (!req.user?.employeeId) {
      throw new ApiError(400, "Employee id is required");
    }

    const result = await eventService.getMyRegistrations(req.user.employeeId);
    return sendSuccess(res, result, MESSAGES.FETCHED, 200);
  },
};