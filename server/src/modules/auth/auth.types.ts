import type { UserRole } from "../../common/constants/userRoles.js";

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  employeeId: number;
  email: string;
  role: UserRole;
};

export type CreateAccountInput = {
  employeeId: number;
  email: string;
  password: string;
  role?: UserRole;
};