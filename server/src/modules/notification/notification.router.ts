import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { notificationController } from "./notification.controller.js";

export const notificationRouter = Router();

notificationRouter.get(
	"/",
	authenticate,
	authorize([
		UserRole.EMPLOYEE,
		UserRole.HR_COORDINATOR,
		UserRole.HR_OPERATIONS_MANAGER,
		UserRole.COMPLIANCE_REVIEWER,
		UserRole.SUPER_ADMIN,
	]),
	catchAsync(notificationController.getNotifications),
);

notificationRouter.put(
	"/read/:id",
	authenticate,
	authorize([
		UserRole.EMPLOYEE,
		UserRole.HR_COORDINATOR,
		UserRole.HR_OPERATIONS_MANAGER,
		UserRole.COMPLIANCE_REVIEWER,
		UserRole.SUPER_ADMIN,
	]),
	catchAsync(notificationController.markAsRead),
);