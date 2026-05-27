import bcrypt from "bcryptjs";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { signToken } from "../../common/utils/jwt.js";
import { auditLogger } from "../../common/services/auditLogger.service.js";
import type { LoginInput } from "./auth.types.js";
import type { SuperAdminSignupInput } from "./auth.types.js";
import type { EmployeeLoginInput } from "./auth.types.js";
import { UserRole } from "../../common/constants/userRoles.js";

const frontendRoleMap: Record<string, UserRole> = {
  EMPLOYEE: UserRole.EMPLOYEE,
  HR: UserRole.HR_COORDINATOR,
  HR_MANAGER: UserRole.HR_OPERATIONS_MANAGER,
  "COMPLIANCE-REVIEWER": UserRole.COMPLIANCE_REVIEWER,
  COMPLIANCE_REVIEWER: UserRole.COMPLIANCE_REVIEWER,
  SUPER_ADMIN: UserRole.SUPER_ADMIN,
};

const responseRoleMap: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: "EMPLOYEE",
  [UserRole.HR_COORDINATOR]: "HR",
  [UserRole.HR_OPERATIONS_MANAGER]: "HR_MANAGER",
  [UserRole.COMPLIANCE_REVIEWER]: "COMPLIANCE_REVIEWER",
  [UserRole.SUPER_ADMIN]: "SUPER_ADMIN",
};

const resolveRequestedRole = (role?: string) => {
  if (!role) return undefined;
  const normalized = role.trim().toUpperCase().replace(/\s+/g, "_");
  return frontendRoleMap[normalized] ?? frontendRoleMap[role] ?? undefined;
};

export const authService = {
  // Employee login flow
  async employeeLogin(input: EmployeeLoginInput) {
    const requestedRole = input.role;
    const account = await prisma.authAccount.findUnique({ where: { email: input.email }, include: { employee: true } });

    if (!account || !account.isActive) throw new ApiError(401, "Invalid credentials");

    const passwordValid = await bcrypt.compare(input.password, account.passwordHash);
    if (!passwordValid) throw new ApiError(401, "Invalid credentials");

    if (requestedRole) {
      const expectedRole = resolveRequestedRole(requestedRole);
      if (expectedRole && account.role !== expectedRole) throw new ApiError(401, "Invalid credentials");
    }

    await prisma.authAccount.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });

    await auditLogger.logAuditEvent({
      eventType: "Login Success",
      employeeId: account.employeeId ?? undefined,
      channel: "AUTH",
      outcome: "Success",
    });

    const token = signToken({ id: account.id, employeeId: account.employeeId, email: account.email, role: account.role });

    return { token, user: { id: account.id, employeeId: account.employeeId, email: account.email, role: responseRoleMap[account.role], employee: account.employee }, role: responseRoleMap[account.role] };
  },

  // Super-admin login (explicit)
  async superAdminLogin(input: LoginInput) {
    const account = await prisma.authAccount.findUnique({ where: { email: input.email }, include: { employee: true } });

    if (!account || !account.isActive) throw new ApiError(401, "Invalid credentials");

    const passwordValid = await bcrypt.compare(input.password, account.passwordHash);
    if (!passwordValid) throw new ApiError(401, "Invalid credentials");

    if (account.role !== UserRole.SUPER_ADMIN) throw new ApiError(401, "Invalid credentials");

    await prisma.authAccount.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });

    await auditLogger.logAuditEvent({
      eventType: "Login Success",
      employeeId: account.employeeId ?? undefined,
      channel: "AUTH",
      outcome: "Success",
    });

    const token = signToken({ id: account.id, employeeId: account.employeeId, email: account.email, role: account.role });

    return { token, user: { id: account.id, employeeId: account.employeeId, email: account.email, role: responseRoleMap[account.role], employee: account.employee }, role: responseRoleMap[account.role] };
  },

  // Super-admin signup
  async superAdminSignup(input: SuperAdminSignupInput) {
    const existing = await prisma.authAccount.findUnique({ where: { email: input.email } });
    if (existing) throw new ApiError(400, "Account with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, 10);

    const account = await prisma.authAccount.create({ data: { employeeId: null, email: input.email, passwordHash, role: UserRole.SUPER_ADMIN } });

    const token = signToken({ id: account.id, employeeId: null, email: account.email, role: account.role });

    return { token, user: { id: account.id, employeeId: null, email: account.email, role: responseRoleMap[account.role], name: input.name, companyName: input.companyName }, role: responseRoleMap[account.role] };
  },
};