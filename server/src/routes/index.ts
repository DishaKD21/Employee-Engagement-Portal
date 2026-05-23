import { Router } from "express";
import { authRouter } from "../modules/auth/auth.router.js";
import { employeeRouter } from "../modules/employee/employee.router.js";
import { eventRouter } from "../modules/event/event.router.js";
import { surveyRouter } from "../modules/survey/survey.router.js";
import { notificationRouter } from "../modules/notification/notification.router.js";
import { chatbotRouter } from "../modules/chatbot/chatbot.router.js";
import { knowledgeBaseRouter } from "../modules/knowledge-base/knowledge-base.router.js";
import { auditRouter } from "../modules/audit/audit.router.js";
import { approvalRouter } from "../modules/approval/approval.router.js";

export const routes = Router();

routes.use("/auth", authRouter);
routes.use("/employees", employeeRouter);
routes.use("/events", eventRouter);
routes.use("/surveys", surveyRouter);
routes.use("/notifications", notificationRouter);
routes.use("/chatbot", chatbotRouter);
routes.use("/knowledge-base", knowledgeBaseRouter);
routes.use("/audit", auditRouter);
routes.use("/approvals", approvalRouter);