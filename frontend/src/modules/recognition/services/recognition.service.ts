import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "@/modules/auth/services/auth.helpers";

export const recognitionEventTypes = ["BIRTHDAY", "WORK_ANNIVERSARY"] as const;

export type RecognitionEventType = (typeof recognitionEventTypes)[number];

export type RecognitionTemplateFormValues = {
  template_name: string;
  event_type: RecognitionEventType;
  content: string;
};

export type RecognitionTemplateRecord = {
  templateId: number;
  templateName: string | null;
  eventType: RecognitionEventType | null;
  content: string | null;
  version: number | null;
  isActive: boolean | null;
  createdBy: number | null;
  approvedStatus: string | null;
  createdAt: string;
  approvalId?: number | null;
};

export type RecognitionApprovalRecord = {
  approvalId: number;
  status: string | null;
  comments: string | null;
  createdAt: string;
  template: RecognitionTemplateRecord | null;
};

export type RecognitionDeliveryRecord = {
  id: number;
  eventId: number | null;
  channel: string | null;
  deliveryStatus: string | null;
  retryCount: number | null;
  deliveredAt: string | null;
};

export type RecognitionEventRecord = {
  eventId: number;
  employeeId: number | null;
  employeeName: string | null;
  employeeEmail: string | null;
  eventType: RecognitionEventType | null;
  triggerDate: string | null;
  templateId: number | null;
  deliveryStatus: string | null;
  createdAt: string;
  template: RecognitionTemplateRecord | null;
  deliveryLogs: RecognitionDeliveryRecord[];
};

export type RecognitionNotificationRecord = {
  notificationId: number;
  employeeId: number | null;
  title: string | null;
  message: string | null;
  notificationType: string | null;
  relatedId: number | null;
  relatedType: string | null;
  channel: string | null;
  status: string | null;
  retryCount: number | null;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
  delivery: RecognitionDeliveryRecord | null;
};

async function postWithToken<T>(url: string, body: unknown, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.post(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

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

async function deleteWithToken<T>(url: string, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

export async function getRecognitionTemplates(token: string) {
  return getWithToken<RecognitionTemplateRecord[]>('/api/recognition/templates', token);
}

export async function createRecognitionTemplate(input: RecognitionTemplateFormValues, token: string) {
  return postWithToken<RecognitionTemplateRecord>('/api/recognition/templates/create', input, token);
}

export async function updateRecognitionTemplate(templateId: number, input: Partial<RecognitionTemplateFormValues>, token: string) {
  return putWithToken<RecognitionTemplateRecord>(`/api/recognition/templates/update/${templateId}`, input, token);
}

export async function deleteRecognitionTemplate(templateId: number, token: string) {
  return deleteWithToken<{ deleted: boolean }>(`/api/recognition/templates/delete/${templateId}`, token);
}

export async function getTemplateApprovals(token: string) {
  return getWithToken<RecognitionApprovalRecord[]>('/api/recognition/templates/approvals', token);
}

export async function approveRecognitionTemplate(approvalId: number, token: string) {
  return putWithToken<RecognitionApprovalRecord>(`/api/recognition/templates/approve/${approvalId}`, {}, token);
}

export async function rejectRecognitionTemplate(approvalId: number, token: string, comments?: string) {
  return putWithToken<RecognitionApprovalRecord>(`/api/recognition/templates/reject/${approvalId}`, { comments }, token);
}

export async function getRecognitionEvents(token: string) {
  return getWithToken<RecognitionEventRecord[]>('/api/recognition/events', token);
}