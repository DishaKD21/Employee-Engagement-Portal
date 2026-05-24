import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { superAdminController } from "./superAdmin.controller.js";
import { createEmployeeAccountSchema } from "./superAdmin.validation.js";

export const superAdminRouter = Router();

superAdminRouter.post(
  "/create-account",
  authenticate,
  authorize([UserRole.SUPER_ADMIN]),
  validate(createEmployeeAccountSchema),
  catchAsync(superAdminController.createEmployeeAccount),
);