import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { queryEscalationController } from "./query-escalation.controller.js";
import { queryEscalationResolutionSchema } from "./query-escalation.validation.js";

export const queryEscalationRouter = Router();

queryEscalationRouter.get(
  "/",
  authenticate,
  authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
  catchAsync(queryEscalationController.listEscalations),
);

queryEscalationRouter.patch(
  "/:id/resolve",
  authenticate,
  authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]),
  validate(queryEscalationResolutionSchema),
  catchAsync(queryEscalationController.resolveEscalation),
);