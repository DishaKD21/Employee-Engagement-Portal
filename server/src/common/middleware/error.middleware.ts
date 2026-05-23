import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: "Validation failed", details: err.flatten() });
  }

  if (err && typeof err === "object" && "code" in err) {
    return res.status(400).json({ success: false, message: (err as any).message ?? "Database error", code: (err as any).code });
  }

  return res.status(500).json({ success: false, message: "Internal server error" });
};