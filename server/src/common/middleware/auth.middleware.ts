import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";
import { UserRole } from "../constants/userRoles.js";

const roleAliases: Record<string, UserRole> = {
  HR: UserRole.HR_COORDINATOR,
  HR_MANAGER: UserRole.HR_OPERATIONS_MANAGER,
  "HR OPERATIONS MANAGER": UserRole.HR_OPERATIONS_MANAGER,
  COMPLIANCE_REVIEWER: UserRole.COMPLIANCE_REVIEWER,
  "COMPLIANCE-REVIEWER": UserRole.COMPLIANCE_REVIEWER,
};

function normalizeRole(role: string) {
  const normalized = role.trim().toUpperCase().replace(/\s+/g, "_");
  return roleAliases[normalized] ?? (normalized as UserRole);
}

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
      role: normalizeRole(payload.role),
    };

    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
};