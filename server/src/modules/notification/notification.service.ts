import { NotificationStatus, NotificationType } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";

export const notificationService = {
	async getNotifications(employeeId: number) {
		const notifications = await prisma.notification.findMany({
			where: { employeeId },
			orderBy: { createdAt: "desc" },
		});

		const recognitionNotifications = notifications.filter((notification) => notification.notificationType === NotificationType.recognition);
		const deliveryLogs = recognitionNotifications.length
			? await prisma.notificationDelivery.findMany({
					where: {
						eventId: {
							in: recognitionNotifications
								.map((notification) => notification.relatedId)
								.filter((value): value is number => value !== null),
						},
					},
					orderBy: { deliveredAt: "desc" },
				})
			: [];

		const deliveryByEventId = new Map<number, (typeof deliveryLogs)[number]>();
		for (const delivery of deliveryLogs) {
			if (delivery.eventId !== null && !deliveryByEventId.has(delivery.eventId)) {
				deliveryByEventId.set(delivery.eventId, delivery);
			}
		}

		return notifications.map((notification) => ({
			...notification,
			delivery: notification.relatedId ? deliveryByEventId.get(notification.relatedId) ?? null : null,
		}));
	},

	async markAsRead(notificationId: number, employeeId: number) {
		const notification = await prisma.notification.findUnique({ where: { notificationId } });

		if (!notification || notification.employeeId !== employeeId) {
			throw new ApiError(404, "Notification not found");
		}

		const updated = await prisma.notification.update({
			where: { notificationId },
			data: {
				readAt: new Date(),
				status: notification.status === NotificationStatus.failed ? NotificationStatus.failed : NotificationStatus.sent,
			},
		});

		return updated;
	},
};