import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { eventController } from "./event.controller.js";
import { registerEventSchema } from "./event.validation.js";

export const eventRouter = Router();

eventRouter.use(authenticate);
eventRouter.get("/:eventId", catchAsync(eventController.getById));
eventRouter.post("/:eventId/submit", validate(registerEventSchema), catchAsync(eventController.register));