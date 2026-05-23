import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return res.status(200).json(new ApiResponse("Login successful", result));
  },

  async me(req: Request, res: Response) {
    const account = await authService.me(req.user!.employeeId);
    return res.status(200).json(new ApiResponse("Profile fetched successfully", { account }));
  },

  async createAccount(req: Request, res: Response) {
    const account = await authService.createAccount(req.body);
    return res.status(201).json(new ApiResponse("Account created", account));
  },
};