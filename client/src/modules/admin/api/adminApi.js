import { request, unwrapApiResponse } from "@/lib/api-client";

const API_V1 = "/api/v1";

export async function createAccountApi(payload) {
  const response = await request("post", `${API_V1}/auth/create-account`, payload);
  return unwrapApiResponse(response);
}
