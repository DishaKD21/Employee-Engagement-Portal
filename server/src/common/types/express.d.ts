import type { UserRole } from "../constants/userRoles.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        employeeId: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};