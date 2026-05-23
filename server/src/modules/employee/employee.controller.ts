import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { employeeService } from "./employee.service.js";

export const employeeController = {
  async me(req: Request, res: Response) {
    const employee = await employeeService.getMe(req.user!.employeeId);
    return res.status(200).json(new ApiResponse("Employee profile fetched successfully", employee));
  },

  async updateMe(req: Request, res: Response) {
    const employee = await employeeService.updateMe(req.user!.employeeId, req.body);
    return res.status(200).json(new ApiResponse("Employee profile updated successfully", employee));
  },

  async events(req: Request, res: Response) {
    const events = await employeeService.listEvents(req.user!.employeeId);
    return res.status(200).json(new ApiResponse("Employee events fetched successfully", events));
  },

  async surveys(req: Request, res: Response) {
    const surveys = await employeeService.listSurveys(req.user!.employeeId);
    return res.status(200).json(new ApiResponse("Employee surveys fetched successfully", surveys));
  },

  async notifications(req: Request, res: Response) {
    const notifications = await employeeService.listNotifications(req.user!.employeeId);
    return res.status(200).json(new ApiResponse("Employee notifications fetched successfully", notifications));
  },
};