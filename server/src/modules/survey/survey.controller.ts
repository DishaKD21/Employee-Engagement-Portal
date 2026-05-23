import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/ApiResponse.js";
import { surveyService } from "./survey.service.js";

export const surveyController = {
  async getById(req: Request, res: Response) {
    const survey = await surveyService.getSurvey(Number(req.params.surveyId), req.user?.employeeId);
    return res.status(200).json(new ApiResponse("Survey fetched successfully", survey));
  },

  async submit(req: Request, res: Response) {
    const response = await surveyService.submitSurvey(Number(req.params.surveyId), req.user!.employeeId, req.body);
    return res.status(201).json(new ApiResponse("Survey submitted successfully", response));
  },
  async list(req: Request, res: Response) {
    const surveys = await surveyService.listSurveys();
    return res.status(200).json(new ApiResponse("Surveys fetched successfully", surveys));
  },
};