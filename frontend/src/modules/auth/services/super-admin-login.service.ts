import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "./auth.helpers";
import type { AuthPayload } from "./auth.helpers";

export type SuperAdminLoginInput = {
  email: string;
  password: string;
};

export async function loginSuperAdmin(input: SuperAdminLoginInput) {
  const response: AxiosResponse<AuthPayload | { data?: AuthPayload }> = await apiClient.post(
    "/api/super_admin/login",
    input,
  );

  return unwrapApiResponse(response);
}
