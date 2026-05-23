import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { knowledgeBaseController } from "./knowledge-base.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { createArticleSchema } from "./knowledge-base.validation.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";

export const knowledgeBaseRouter = Router();

knowledgeBaseRouter.use(authenticate);
knowledgeBaseRouter.get("/articles", catchAsync(knowledgeBaseController.list));
knowledgeBaseRouter.get("/articles/:articleId", catchAsync(knowledgeBaseController.getById));
knowledgeBaseRouter.post(
	"/articles",
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(createArticleSchema),
	catchAsync(knowledgeBaseController.create),
);
knowledgeBaseRouter.patch(
	"/articles/:articleId",
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	validate(createArticleSchema),
	catchAsync(knowledgeBaseController.update),
);
knowledgeBaseRouter.delete(
	"/articles/:articleId",
	authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
	catchAsync(knowledgeBaseController.remove),
);