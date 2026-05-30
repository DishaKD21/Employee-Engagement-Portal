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
  authorize([UserRole.HR_COORDINATOR, UserRole.SUPER_ADMIN]),
  catchAsync(queryEscalationController.listEscalations),
);

queryEscalationRouter.get(
  "/all",
  authenticate,
  authorize([UserRole.HR_COORDINATOR, UserRole.SUPER_ADMIN]),
  catchAsync(queryEscalationController.listAllForHr),
);

queryEscalationRouter.get(
  "/my",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  catchAsync(queryEscalationController.listMyEscalations),
);

queryEscalationRouter.get(
  "/:id",
  authenticate,
  authorize([UserRole.HR_COORDINATOR, UserRole.SUPER_ADMIN]),
  catchAsync(queryEscalationController.getEscalation),
);

queryEscalationRouter.post(
  "/:id/respond",
  authenticate,
  authorize([UserRole.HR_COORDINATOR, UserRole.SUPER_ADMIN]),
  validate(queryEscalationResolutionSchema),
  catchAsync(queryEscalationController.resolveEscalation),
);

queryEscalationRouter.patch(
  "/:id/resolve",
  authenticate,
  authorize([UserRole.HR_COORDINATOR, UserRole.SUPER_ADMIN]),
  validate(queryEscalationResolutionSchema),
  catchAsync(queryEscalationController.resolveEscalation),
);
