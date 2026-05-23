import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { eventService } from "./event.service.js";

export const eventController = {
  async getById(req: Request, res: Response) {
    const event = await eventService.getEvent(Number(req.params.eventId), req.user?.employeeId);
    return res.status(200).json(new ApiResponse("Event fetched successfully", event));
  },

  async register(req: Request, res: Response) {
    const event = await eventService.registerForEvent(Number(req.params.eventId), req.user!.employeeId, req.body);
    return res.status(200).json(new ApiResponse("Event registration saved successfully", event));
  },
};