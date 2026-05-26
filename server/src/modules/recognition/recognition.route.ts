import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { recognitionController } from "./recognition.controller.js";
import { createRecognitionTemplateSchema, rejectRecognitionTemplateSchema, updateRecognitionTemplateSchema } from "./recognition.validation.js";

export const recognitionRouter = Router();

recognitionRouter.get(
  "/templates",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  catchAsync(recognitionController.getTemplates),
);

recognitionRouter.post(
  "/templates/create",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  validate(createRecognitionTemplateSchema),
  catchAsync(recognitionController.createTemplate),
);

recognitionRouter.put(
  "/templates/update/:id",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  validate(updateRecognitionTemplateSchema),
  catchAsync(recognitionController.updateTemplate),
);

recognitionRouter.delete(
  "/templates/delete/:id",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  catchAsync(recognitionController.deleteTemplate),
);

recognitionRouter.get(
  "/templates/approvals",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  catchAsync(recognitionController.getTemplateApprovals),
);

recognitionRouter.put(
  "/templates/approve/:id",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  catchAsync(recognitionController.approveTemplate),
);

recognitionRouter.put(
  "/templates/reject/:id",
  authenticate,
  authorize([UserRole.HR_OPERATIONS_MANAGER]),
  validate(rejectRecognitionTemplateSchema),
  catchAsync(recognitionController.rejectTemplate),
);

recognitionRouter.get(
  "/events",
  authenticate,
  authorize([UserRole.HR_COORDINATOR, UserRole.HR_OPERATIONS_MANAGER]),
  catchAsync(recognitionController.getRecognitionEvents),
);