import { Router } from "express";
import { authRouter } from "../modules/auth/auth.router.js";

export const routes = Router();

routes.use(authRouter);