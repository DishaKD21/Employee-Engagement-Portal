import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./common/middleware/error.middleware.js";
import { prisma } from "./config/db.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "OK" });
  });

  app.get("/health/db", async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ success: true, message: "Database connected" });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/v1", routes);
  app.use(errorMiddleware);

  return app;
};