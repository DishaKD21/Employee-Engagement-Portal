import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { authController } from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";
import { createAccountSchema } from "./auth.validation.js";
import { UserRole } from "../../common/constants/userRoles.js";

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), catchAsync(authController.login));
authRouter.get("/me", authenticate, catchAsync(authController.me));
authRouter.post(
	"/create-account",
	authenticate,
	authorize([UserRole.SUPER_ADMIN]),
	validate(createAccountSchema),
	catchAsync(authController.createAccount),
);