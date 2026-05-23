import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { approvalController } from "./approval.controller.js";
import { approvalActionSchema } from "./approval.validation.js";

export const approvalRouter = Router();

approvalRouter.use(authenticate, authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.SUPER_ADMIN]));
approvalRouter.get("/pending", catchAsync(approvalController.list));
approvalRouter.post("/:id/approve", validate(approvalActionSchema), catchAsync(approvalController.approve));
approvalRouter.post("/:id/reject", validate(approvalActionSchema), catchAsync(approvalController.reject));