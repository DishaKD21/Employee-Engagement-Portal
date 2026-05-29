import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { chatbotController } from "./chatbot.controller.js";
import { chatbotQuerySchema } from "./chatbot.validation.js";

export const chatbotRouter = Router();

chatbotRouter.post(
	"/query",
	authenticate,
	authorize([
		UserRole.EMPLOYEE,
		UserRole.HR_COORDINATOR,
		UserRole.HR_OPERATIONS_MANAGER,
		UserRole.COMPLIANCE_REVIEWER,
		UserRole.SUPER_ADMIN,
	]),
	validate(chatbotQuerySchema),
	catchAsync(chatbotController.query),
);

chatbotRouter.get(
	"/history",
	authenticate,
	authorize([
		UserRole.EMPLOYEE,
		UserRole.HR_COORDINATOR,
		UserRole.HR_OPERATIONS_MANAGER,
		UserRole.COMPLIANCE_REVIEWER,
		UserRole.SUPER_ADMIN,
	]),
	catchAsync(chatbotController.history),
);