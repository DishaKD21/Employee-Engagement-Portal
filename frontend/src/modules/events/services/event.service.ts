import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "@/modules/auth/services/auth.helpers";

export type EventFormValues = {
  event_name: string;
  event_type: string;
  description?: string;
  target_audience: string;
  registration_start: string;
  registration_end: string;
  event_date: string;
};

export type EventCreator = {
  employeeId: number;
  name: string;
  email: string;
};

export type EventRecord = {
  eventId: number;
  eventName: string | null;
  eventType: string | null;
  description: string | null;
  targetAudience: string | null;
  registrationStart: string;
  registrationEnd: string;
  eventDate: string;
  publishedDate: string | null;
  status: string | null;
  approvedStatus: string | null;
  createdBy: number | null;
  creator?: EventCreator | null;
  approvalId?: number | null;
  workflowStatus?: string | null;
};

export type ApprovalRecord = {
  approvalId: number;
  status: string | null;
  comments: string | null;
  createdAt: string;
  event: EventRecord | null;
};

export type RegistrationRecord = {
  id: number;
  eventId: number | null;
  employeeId: number | null;
  registrationStatus: boolean | null;
  participationStatus: string | null;
  feedbackRating: number | null;
  feedbackText: string | null;
  createdAt: string;
  event: EventRecord | null;
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

export async function createEvent(input: EventFormValues, token: string) {
  return postWithToken<EventRecord>("/api/events/create", input, token);
}

export async function getMyEvents(token: string) {
  return getWithToken<EventRecord[]>("/api/events/my-events", token);
}

export async function updateEvent(eventId: number, input: Partial<EventFormValues>, token: string) {
  return putWithToken<EventRecord>(`/api/events/update/${eventId}`, input, token);
}

export async function deleteEvent(eventId: number, token: string) {
  return deleteWithToken<{ deleted: boolean }>(`/api/events/delete/${eventId}`, token);
}

export async function getPendingApprovals(token: string) {
  return getWithToken<ApprovalRecord[]>("/api/approvals/pending", token);
}

export async function approveEvent(approvalId: number, token: string) {
  return putWithToken<ApprovalRecord>(`/api/approvals/approve/${approvalId}`, {}, token);
}

export async function rejectEvent(approvalId: number, token: string, comments?: string) {
  return putWithToken<ApprovalRecord>(`/api/approvals/reject/${approvalId}`, { comments }, token);
}

export async function getPublishedEvents(token: string) {
  return getWithToken<EventRecord[]>("/api/events/published", token);
}

export async function registerForEvent(eventId: number, token: string) {
  return postWithToken<RegistrationRecord>(`/api/events/register/${eventId}`, {}, token);
}

export async function getMyRegistrations(token: string) {
  return getWithToken<RegistrationRecord[]>("/api/events/my-registrations", token);
}