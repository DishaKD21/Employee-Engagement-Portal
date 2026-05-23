import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { catchAsync } from "../../common/utils/catchAsync.js";
import { chatbotController } from "./chatbot.controller.js";
import { submitQuerySchema } from "./chatbot.validation.js";

export const chatbotRouter = Router();

chatbotRouter.use(authenticate);
chatbotRouter.post("/query", validate(submitQuerySchema), catchAsync(chatbotController.submitQuery));