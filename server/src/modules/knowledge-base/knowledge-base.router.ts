import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { knowledgeBaseController } from "./knowledge-base.controller.js";
import {
	approvalActionSchema,
	knowledgeBaseArticleSchema,
	knowledgeBaseArticleUpdateSchema,
} from "./knowledge-base.validation.js";

export const knowledgeBaseRouter = Router();

knowledgeBaseRouter.get(
	"/articles",
	authenticate,
	authorize([
		UserRole.EMPLOYEE,
		UserRole.HR_COORDINATOR,
		UserRole.HR_OPERATIONS_MANAGER,
		UserRole.COMPLIANCE_REVIEWER,
		UserRole.SUPER_ADMIN,
	]),
	catchAsync(knowledgeBaseController.listArticles),
);

knowledgeBaseRouter.post(
	"/articles",
	authenticate,
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(knowledgeBaseArticleSchema),
	catchAsync(knowledgeBaseController.createArticle),
);

knowledgeBaseRouter.put(
	"/articles/:id",
	authenticate,
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(knowledgeBaseArticleUpdateSchema),
	catchAsync(knowledgeBaseController.updateArticle),
);

knowledgeBaseRouter.post(
	"/articles/:id/submit",
	authenticate,
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	catchAsync(knowledgeBaseController.submitForApproval),
);

knowledgeBaseRouter.post(
	"/articles/:id/approve",
	authenticate,
	authorize([UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(approvalActionSchema),
	catchAsync(knowledgeBaseController.approveArticle),
);

knowledgeBaseRouter.put(
	"/articles/:id/approve",
	authenticate,
	authorize([UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(approvalActionSchema),
	catchAsync(knowledgeBaseController.approveArticle),
);

knowledgeBaseRouter.post(
	"/articles/:id/reject",
	authenticate,
	authorize([UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(approvalActionSchema),
	catchAsync(knowledgeBaseController.rejectArticle),
);

knowledgeBaseRouter.put(
	"/articles/:id/reject",
	authenticate,
	authorize([UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(approvalActionSchema),
	catchAsync(knowledgeBaseController.rejectArticle),
);

knowledgeBaseRouter.post(
	"/articles/:id/publish",
	authenticate,
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	catchAsync(knowledgeBaseController.publishArticle),
);

knowledgeBaseRouter.get(
	"/approvals/pending",
	authenticate,
	authorize([UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	catchAsync(knowledgeBaseController.listPendingApprovals),
);