import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { authorize } from "../../common/middleware/authorize.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { UserRole } from "../../common/constants/userRoles.js";
import { eventController } from "./event.controller.js";
import { createEventSchema, registerEventSchema, updateEventSchema } from "./event.validation.js";

export const eventRouter = Router();

eventRouter.post(
  "/create",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  validate(createEventSchema),
  catchAsync(eventController.createEvent),
);

eventRouter.get(
  "/my-events",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  catchAsync(eventController.getMyEvents),
);

eventRouter.put(
  "/update/:id",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  validate(updateEventSchema),
  catchAsync(eventController.updateEvent),
);

eventRouter.delete(
  "/delete/:id",
  authenticate,
  authorize([UserRole.HR_COORDINATOR]),
  catchAsync(eventController.deleteEvent),
);

eventRouter.get(
  "/published",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  catchAsync(eventController.getPublishedEvents),
);

eventRouter.post(
  "/register/:id",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  validate(registerEventSchema),
  catchAsync(eventController.registerForEvent),
);

eventRouter.get(
  "/my-registrations",
  authenticate,
  authorize([UserRole.EMPLOYEE]),
  catchAsync(eventController.getMyRegistrations),
);