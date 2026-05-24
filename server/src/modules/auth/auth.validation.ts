import { z } from "zod";
import { UserRole } from "../../common/constants/userRoles.js";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const employeeLoginSchema = loginSchema.extend({
  role: z.string().optional(),
});

export const superAdminSignupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(1).optional(),
});
