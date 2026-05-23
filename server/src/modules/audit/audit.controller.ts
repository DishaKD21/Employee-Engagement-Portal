import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { auditService } from "./audit.service.js";

export const auditController = {
  async list(_req: Request, res: Response) {
    const logs = await auditService.listLogs();
    return res.status(200).json(new ApiResponse("Audit logs fetched successfully", logs));
  },
};