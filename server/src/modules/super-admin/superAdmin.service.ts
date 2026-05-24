import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "crypto";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { sendMail } from "../../utils/sendMail.js";
import type { CreateEmployeeAccountInput } from "./superAdmin.validation.js";

type EmployeeRoleInput = CreateEmployeeAccountInput["role"];

const roleMap: Record<EmployeeRoleInput, UserRole> = {
  EMPLOYEE: UserRole.EMPLOYEE,
  HR: UserRole.HR_COORDINATOR,
  HR_MANAGER: UserRole.HR_OPERATIONS_MANAGER,
  COMPLIANCE_REVIEWER: UserRole.COMPLIANCE_REVIEWER,
};

function formatEmployeeEmail(employeeName: string) {
  const localPart = employeeName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s.]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");

  return `${localPart}@${env.EMPLOYEE_EMAIL_DOMAIN}`;
}

function generateTemporaryPassword() {
  const randomSuffix = randomBytes(4).toString("hex");
  const numericSuffix = randomInt(1000, 9999);

  return `Temp@${randomSuffix}${numericSuffix}`;
}

async function ensureUniqueEmail(baseEmail: string) {
  let candidate = baseEmail;
  let suffix = 1;

  while (
    (await prisma.authAccount.findUnique({ where: { email: candidate }, select: { id: true } })) ||
    (await prisma.employee.findUnique({ where: { email: candidate }, select: { employeeId: true } }))
  ) {
    suffix += 1;
    const [localPart, domainPart] = baseEmail.split("@");
    candidate = `${localPart}${suffix}@${domainPart}`;
  }

  return candidate;
}

function getLoginUrl() {
  return env.FRONTEND_LOGIN_URL ?? "http://localhost:3000/login";
}

export const superAdminService = {
  async createEmployeeAccount(input: CreateEmployeeAccountInput) {
    const role = roleMap[input.role];

    if (!role) {
      throw new ApiError(400, "Invalid role");
    }

    console.log("[super-admin:create-account] request received", {
      employeeName: input.employeeName,
      role: input.role,
    });

    const baseEmail = formatEmployeeEmail(input.employeeName);
    const email = await ensureUniqueEmail(baseEmail);
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    console.log("[super-admin:create-account] generated credentials", {
      email,
      role: input.role,
      temporaryPassword,
    });

    let createdEmployee: { employeeId: number; email: string } | null = null;
    let createdAccount: { id: number; employeeId: number | null; email: string } | null = null;

    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        const employee = await tx.employee.create({
          data: {
            name: input.employeeName.trim(),
            email,
            dateOfBirth: new Date("1990-01-01"),
            joiningDate: new Date(),
            role: input.role,
          },
          select: {
            employeeId: true,
            email: true,
          },
        });

        const account = await tx.authAccount.create({
          data: {
            employeeId: employee.employeeId,
            email,
            passwordHash,
            role,
          },
          select: {
            id: true,
            employeeId: true,
            email: true,
          },
        });

        return { employee, account };
      });

      createdEmployee = transactionResult.employee;
      createdAccount = transactionResult.account;

      console.log("[super-admin:create-account] database insert successful", {
        employeeId: `EMP${createdEmployee.employeeId}`,
        dbEmployeeId: createdEmployee.employeeId,
        id: createdAccount.id,
        email: createdAccount.email,
      });
    } catch (error) {
      console.error("[super-admin:create-account] database insert failed", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ApiError(409, "Employee email already exists");
        }

        if (error.code === "P2003") {
          throw new ApiError(500, "Employee profile could not be linked to auth account");
        }
      }

      throw new ApiError(500, "Failed to create employee account");
    }

    let emailSent = false;

    try {
      await sendMail({
        to: email,
        subject: "Welcome to Ethan Aegis",
        text: [
          `Welcome to Ethan Aegis`,
          ``,
          `Company Email: ${email}`,
          `Temporary Password: ${temporaryPassword}`,
          `Assigned Role: ${input.role}`,
          `Login URL: ${getLoginUrl()}`,
        ].join("\n"),
        html: `
          <h2>Welcome to Ethan Aegis</h2>
          <p><strong>Company Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          <p><strong>Assigned Role:</strong> ${input.role}</p>
          <p><strong>Login URL:</strong> <a href="${getLoginUrl()}">${getLoginUrl()}</a></p>
        `,
      });

      emailSent = true;
      console.log("[super-admin:create-account] email sent", { to: email });
    } catch (error) {
      console.error("[super-admin:create-account] email failed", error);
    }

    if (!emailSent) {
      console.log("[super-admin:create-account] returning without email delivery", {
        email,
        temporaryPassword,
      });
    }

    return {
      employeeId: `EMP${createdEmployee?.employeeId ?? 0}`,
      email,
      role: input.role,
      temporaryPassword,
      message: MESSAGES.ACCOUNT_CREATED,
      emailSent,
      emailWarning: emailSent ? undefined : "Employee account created, but email delivery failed",
    };
  },
};