import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { surveyController } from "./survey.controller.js";
import { submitSurveySchema } from "./survey.validation.js";

export const surveyRouter = Router();

surveyRouter.use(authenticate);
surveyRouter.get("/:surveyId", catchAsync(surveyController.getById));
surveyRouter.post("/:surveyId/submit", validate(submitSurveySchema), catchAsync(surveyController.submit));

surveyRouter.get("/", catchAsync(surveyController.list));