import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { sendSuccess, sendCreated } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";

export const authController = {
  async employeeLogin(req: Request, res: Response) {
    const result = await authService.employeeLogin(req.body);
    return sendSuccess(res, result, MESSAGES.LOGIN_SUCCESS, 200);
  },

  async superAdminLogin(req: Request, res: Response) {
    const result = await authService.superAdminLogin(req.body);
    return sendSuccess(res, result, MESSAGES.LOGIN_SUCCESS, 200);
  },

  async superAdminSignup(req: Request, res: Response) {
    const result = await authService.superAdminSignup(req.body);
    return sendCreated(res, result, MESSAGES.SIGNUP_SUCCESS);
  },
};