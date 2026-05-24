import { z } from "zod";

export const createEmployeeAccountSchema = z.object({
  employeeName: z.string().trim().min(1, "Employee name is required"),
  role: z.enum(["EMPLOYEE", "HR", "HR_MANAGER", "COMPLIANCE_REVIEWER"]),
});

export type CreateEmployeeAccountInput = z.infer<typeof createEmployeeAccountSchema>;