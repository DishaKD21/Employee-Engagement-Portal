import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { surveyController } from "./survey.controller.js";
import { createSurveySchema, rejectSurveySchema, submitSurveySchema, updateSurveySchema } from "./survey.validation.js";

export const surveyRouter = Router();
export const surveyApprovalRouter = Router();

surveyRouter.post(
  "/create",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  validate(createSurveySchema),
  catchAsync(surveyController.createSurvey),
);

surveyRouter.get(
  "/my-surveys",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  catchAsync(surveyController.getMySurveys),
);

surveyRouter.put(
  "/update/:id",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  validate(updateSurveySchema),
  catchAsync(surveyController.updateSurvey),
);

surveyRouter.delete(
  "/delete/:id",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  catchAsync(surveyController.deleteSurvey),
);

surveyRouter.get(
  "/published",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  catchAsync(surveyController.getPublishedSurveys),
);

surveyRouter.get(
  "/my-submissions",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  catchAsync(surveyController.getMySubmissions),
);

surveyRouter.post(
  "/submit/:id",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  validate(submitSurveySchema),
  catchAsync(surveyController.submitSurvey),
);

surveyRouter.get(
  "/:id",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  catchAsync(surveyController.getSurveyById),
);

surveyApprovalRouter.get(
  "/pending",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  catchAsync(surveyController.getPendingApprovals),
);

surveyApprovalRouter.put(
  "/approve/:id",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  catchAsync(surveyController.approveSurvey),
);

surveyApprovalRouter.put(
  "/reject/:id",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  validate(rejectSurveySchema),
  catchAsync(surveyController.rejectSurvey),
);
