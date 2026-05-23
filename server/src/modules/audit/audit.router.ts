import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { auditController } from "./audit.controller.js";

export const auditRouter = Router();

auditRouter.use(authenticate, authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER, UserRole.COMPLIANCE_REVIEWER, UserRole.SUPER_ADMIN]));
auditRouter.get("/", catchAsync(auditController.list));