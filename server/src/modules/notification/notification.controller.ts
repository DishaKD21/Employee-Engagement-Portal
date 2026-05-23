import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  async list(req: Request, res: Response) {
    const notifications = await notificationService.listForEmployee(req.user!.employeeId);
    return res.status(200).json(new ApiResponse("Notifications fetched successfully", notifications));
  },
  async markRead(req: Request, res: Response) {
    await notificationService.markRead(Number(req.params.id), req.user!.employeeId);
    return res.status(200).json(new ApiResponse("Notification marked read", null));
  },
  async send(req: Request, res: Response) {
    const notification = await notificationService.sendNotification({
      employeeId: req.body.employeeId,
      title: req.body.title,
      message: req.body.message,
      relatedId: req.body.relatedId,
      relatedType: req.body.relatedType,
      channel: req.body.channel,
    });
    return res.status(201).json(new ApiResponse("Notification sent", notification));
  },
};