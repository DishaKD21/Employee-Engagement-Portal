import axios from "axios";
import type { AxiosResponse } from "axios";
import type { AxiosError } from "axios";

export type AuthUser = {
  id?: number | string;
  employeeId?: number | string;
  email?: string;
  name?: string;
  role?: string;
  companyName?: string;
  [key: string]: unknown;
};

export type AuthPayload = {
  token?: string;
  user?: AuthUser;
  role?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export function unwrapApiResponse<T>(response: AxiosResponse<T | { data?: T }>): T {
  const payload = response.data as T | { data?: T };

  if (payload && typeof payload === "object" && "data" in payload && payload.data !== undefined) {
    return payload.data as T;
  }

  return payload as T;
}

const dashboardRoutes: Record<string, string> = {
  EMPLOYEE: "/employee/dashboard",
  HR: "/hr/dashboard",
  HR_MANAGER: "/hr-manager/dashboard",
  COMPLIANCE_REVIEWER: "/compliance-reviewer/dashboard",
  "COMPLIANCE-REVIEWER": "/compliance-reviewer/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
};

export function getDashboardRoute(role?: string | null) {
  if (!role) {
    return "/";
  }

  const normalizedRole = role.trim().toUpperCase().replace(/\s+/g, "_");
  return dashboardRoutes[normalizedRole] ?? dashboardRoutes[role] ?? "/";
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const responseMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error;

    if (responseMessage) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
