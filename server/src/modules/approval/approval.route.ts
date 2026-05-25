import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { approvalController } from "./approval.controller.js";
import { rejectApprovalSchema } from "./approval.validation.js";

export const approvalRouter = Router();

approvalRouter.get(
  "/pending",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  catchAsync(approvalController.getPendingApprovals),
);

approvalRouter.put(
  "/approve/:id",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  catchAsync(approvalController.approveEvent),
);

approvalRouter.put(
  "/reject/:id",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  validate(rejectApprovalSchema),
  catchAsync(approvalController.rejectEvent),
);