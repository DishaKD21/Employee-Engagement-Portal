import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "@/modules/auth/services/auth.helpers";

export type CreateEmployeeAccountInput = {
  employeeName: string;
  role: "EMPLOYEE" | "HR" | "HR_MANAGER" | "COMPLIANCE_REVIEWER";
};

export type CreateEmployeeAccountResponse = {
  employeeId: string;
  email: string;
  role: string;
  temporaryPassword: string;
  message: string;
  emailSent?: boolean;
  emailWarning?: string;
};

export async function createEmployeeAccount(input: CreateEmployeeAccountInput, token: string) {
  const response: AxiosResponse<CreateEmployeeAccountResponse | { data?: CreateEmployeeAccountResponse }> =
    await apiClient.post("/api/super-admin/create-account", input, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return unwrapApiResponse(response);
}