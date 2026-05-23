import { apiClient } from "@/lib/axios";

export async function request(method, url, data, config = {}) {
  const response = await apiClient.request({
    method,
    url,
    data,
    ...config,
  });

  return response.data;
}

export function unwrapApiResponse(response) {
  return response?.data ?? response;
}
