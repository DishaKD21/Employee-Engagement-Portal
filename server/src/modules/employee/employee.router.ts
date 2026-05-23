import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { employeeController } from "./employee.controller.js";
import { updateMeSchema } from "./employee.validation.js";

export const employeeRouter = Router();

employeeRouter.use(authenticate);
employeeRouter.get("/me", catchAsync(employeeController.me));
employeeRouter.patch("/me", validate(updateMeSchema), catchAsync(employeeController.updateMe));
employeeRouter.get("/events", catchAsync(employeeController.events));
employeeRouter.get("/surveys", catchAsync(employeeController.surveys));
employeeRouter.get("/notifications", catchAsync(employeeController.notifications));