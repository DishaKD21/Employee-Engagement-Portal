import { Router } from "express";
import { authRouter } from "../modules/auth/auth.router.js";
import { approvalRouter } from "../modules/approval/approval.route.js";
import { eventRouter } from "../modules/event/event.route.js";
import { superAdminRouter } from "../modules/super-admin/superAdmin.route.js";

export const routes = Router();

routes.use(authRouter);
routes.use("/events", eventRouter);
routes.use("/approvals", approvalRouter);
routes.use("/super-admin", superAdminRouter);