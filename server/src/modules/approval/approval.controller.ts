import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { approvalService } from "./approval.service.js";

export const approvalController = {
  async list(_req: Request, res: Response) {
    const approvals = await approvalService.listPending();
    return res.status(200).json(new ApiResponse("Pending approvals fetched successfully", approvals));
  },
  async approve(req: Request, res: Response) {
    const approval = await approvalService.approve(Number(req.params.id), req.user!.employeeId, req.body.comments);
    return res.status(200).json(new ApiResponse("Approval approved successfully", approval));
  },
  async reject(req: Request, res: Response) {
    const approval = await approvalService.reject(Number(req.params.id), req.user!.employeeId, req.body.comments);
    return res.status(200).json(new ApiResponse("Approval rejected successfully", approval));
  },
};