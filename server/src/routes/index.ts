import { Router } from "express";
import { authRouter } from "../modules/auth/auth.router.js";
import { approvalRouter } from "../modules/approval/approval.route.js";
import { auditRouter } from "../modules/audit/audit.router.js";
import { eventRouter } from "../modules/event/event.route.js";
import { notificationRouter } from "../modules/notification/notification.router.js";
import { recognitionRouter } from "../modules/recognition/recognition.route.js";
import { chatbotRouter } from "../modules/chatbot/chatbot.router.js";
import { knowledgeBaseRouter } from "../modules/knowledge-base/knowledge-base.router.js";
import { queryEscalationRouter } from "../modules/query-escalation/query-escalation.router.js";
import { surveyApprovalRouter, surveyRouter } from "../modules/surveys/survey.route.js";
import { superAdminRouter } from "../modules/super-admin/superAdmin.route.js";

export const routes = Router();

routes.use(authRouter);
routes.use("/events", eventRouter);
routes.use("/approvals", approvalRouter);
routes.use("/audit", auditRouter);
routes.use("/chatbot", chatbotRouter);
routes.use("/knowledge-base", knowledgeBaseRouter);
routes.use("/query-escalations", queryEscalationRouter);
routes.use("/recognition", recognitionRouter);
routes.use("/notifications", notificationRouter);
routes.use("/surveys", surveyRouter);
routes.use("/survey-approvals", surveyApprovalRouter);
routes.use("/super-admin", superAdminRouter); 