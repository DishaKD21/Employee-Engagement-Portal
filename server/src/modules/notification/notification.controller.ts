import type { Request, Response } from "express";
import { ApiError } from "../../common/utils/ApiError.js";
import { sendSuccess } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { notificationService } from "./notification.service.js";

function getNotificationIdParam(value: string | string[]) {
	const normalized = Array.isArray(value) ? value[0] : value;
	const parsed = Number(normalized);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new ApiError(400, "Invalid notification id");
	}

	return parsed;
}

export const notificationController = {
	async getNotifications(req: Request, res: Response) {
		if (!req.user?.employeeId) {
			throw new ApiError(400, "Employee id is required");
		}

		const result = await notificationService.getNotifications(req.user.employeeId);
		return sendSuccess(res, result, MESSAGES.FETCHED, 200);
	},

	async markAsRead(req: Request, res: Response) {
		if (!req.user?.employeeId) {
			throw new ApiError(400, "Employee id is required");
		}

		const notificationId = getNotificationIdParam(req.params.id);
		const result = await notificationService.markAsRead(notificationId, req.user.employeeId);
		return sendSuccess(res, result, MESSAGES.UPDATED, 200);
	},
};