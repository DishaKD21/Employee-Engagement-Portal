import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { notificationController } from "./notification.controller.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { sendNotificationSchema } from "./notification.validation.js";

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get("/", catchAsync(notificationController.list));
notificationRouter.post(
	"/:id/read",
	catchAsync(notificationController.markRead),
);
notificationRouter.post(
	"/send",
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(sendNotificationSchema),
	catchAsync(notificationController.send),
);