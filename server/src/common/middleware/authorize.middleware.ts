import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import type { UserRole } from "../constants/userRoles.js";

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden"));
    }

    return next();
  };
};