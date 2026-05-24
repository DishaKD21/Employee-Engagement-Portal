import { Router } from "express";
import { authRouter } from "../modules/auth/auth.router.js";
import { superAdminRouter } from "../modules/super-admin/superAdmin.route.js";

export const routes = Router();

routes.use(authRouter);
routes.use("/super-admin", superAdminRouter);