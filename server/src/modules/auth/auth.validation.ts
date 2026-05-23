import { z } from "zod";
import { UserRole } from "../../common/constants/userRoles.js";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createAccountSchema = z.object({
  employeeId: z.number().int().positive(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).optional(),
});