import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { chatbotService } from "./chatbot.service.js";

export const chatbotController = {
  async submitQuery(req: Request, res: Response) {
    const query = await chatbotService.submitQuery(req.user!.employeeId, req.body);
    return res.status(201).json(new ApiResponse("Query submitted successfully", query));
  },
};