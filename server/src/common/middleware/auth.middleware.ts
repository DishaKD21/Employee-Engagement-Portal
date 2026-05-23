import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";
import { UserRole } from "../constants/userRoles.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  try {
    const payload = verifyToken(header.slice(7));

    req.user = {
      id: payload.id,
      employeeId: payload.employeeId,
      email: payload.email,
      role: payload.role as UserRole,
    };

    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
};