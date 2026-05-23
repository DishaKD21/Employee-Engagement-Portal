import bcrypt from "bcryptjs";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { signToken } from "../../common/utils/jwt.js";
import type { LoginInput } from "./auth.types.js";
import type { CreateAccountInput } from "./auth.types.js";

export const authService = {
  async login(input: LoginInput) {
    const account = await prisma.authAccount.findUnique({
      where: { email: input.email },
      include: { employee: true },
    });

    if (!account || !account.isActive) {
      throw new ApiError(401, "Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(input.password, account.passwordHash);

    if (!passwordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (account.employeeId == null) {
      throw new ApiError(500, "Account is not linked to an employee");
    }

    await prisma.authAccount.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({
      id: account.id,
      employeeId: account.employeeId,
      email: account.email,
      role: account.role,
    });

    return {
      token,
      user: {
        id: account.id,
        employeeId: account.employeeId,
        email: account.email,
        role: account.role,
        employee: account.employee,
      },
    };
  },

  async createAccount(input: CreateAccountInput) {
    const existing = await prisma.authAccount.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(400, "Account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const account = await prisma.authAccount.create({
      data: {
        employeeId: input.employeeId,
        email: input.email,
        passwordHash,
        role: input.role ?? undefined,
      },
    });

    return account;
  },

  async me(employeeId: number) {
    const account = await prisma.authAccount.findUnique({
      where: { employeeId },
      include: { employee: true },
    });

    if (!account) {
      throw new ApiError(404, "Authenticated user not found");
    }

    return account;
  },
};