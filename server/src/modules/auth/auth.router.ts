import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { authController } from "./auth.controller.js";
import { employeeLoginSchema } from "./auth.validation.js";
import { loginSchema } from "./auth.validation.js";
import { superAdminSignupSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/super_admin/signup", validate(superAdminSignupSchema), catchAsync(authController.superAdminSignup));
authRouter.post("/super_admin/login", validate(loginSchema), catchAsync(authController.superAdminLogin));
authRouter.post("/employee/login", validate(employeeLoginSchema), catchAsync(authController.employeeLogin));
