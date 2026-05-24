import type { Request, Response } from "express";
import { superAdminService } from "./superAdmin.service.js";
import { sendCreated } from "../../common/utils/responseHelpers.js";
import { MESSAGES } from "../../common/constants/messages.js";

export const superAdminController = {
  async createEmployeeAccount(req: Request, res: Response) {
    console.log("[super-admin:create-account] controller body", req.body);
    const result = await superAdminService.createEmployeeAccount(req.body);
    console.log("[super-admin:create-account] controller result", {
      employeeId: result.employeeId,
      email: result.email,
      role: result.role,
      emailSent: result.emailSent,
    });
    return sendCreated(res, result, MESSAGES.ACCOUNT_CREATED);
  },
};