import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "./auth.helpers";
import type { AuthPayload } from "./auth.helpers";

export type SuperAdminSignupInput = {
  name: string;
  email: string;
  password: string;
  companyName?: string;
};

export async function signupSuperAdmin(input: SuperAdminSignupInput) {
  const response: AxiosResponse<AuthPayload | { data?: AuthPayload }> = await apiClient.post(
    "/api/super_admin/signup",
    input,
  );

  return unwrapApiResponse(response);
}
