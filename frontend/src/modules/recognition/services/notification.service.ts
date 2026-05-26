import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "@/modules/auth/services/auth.helpers";
import type { RecognitionNotificationRecord } from "./recognition.service";

async function getWithToken<T>(url: string, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

async function putWithToken<T>(url: string, body: unknown, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.put(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

export async function getNotifications(token: string) {
  return getWithToken<RecognitionNotificationRecord[]>('/api/notifications', token);
}

export async function markNotificationRead(notificationId: number, token: string) {
  return putWithToken<RecognitionNotificationRecord>(`/api/notifications/read/${notificationId}`, {}, token);
}