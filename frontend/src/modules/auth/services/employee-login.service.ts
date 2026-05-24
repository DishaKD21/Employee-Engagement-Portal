import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "./auth.helpers";
import type { AuthPayload } from "./auth.helpers";

export type EmployeeLoginInput = {
  email: string;
  password: string;
  role?: string;
};

export async function loginEmployee(input: EmployeeLoginInput) {
  const response: AxiosResponse<AuthPayload | { data?: AuthPayload }> = await apiClient.post(
    "/api/employee/login",
    input,
  );

  return unwrapApiResponse(response);
}
