import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "@/modules/auth/services/auth.helpers";

export type AuditLogEmployee = {
  employeeId: number;
  name: string | null;
  email: string | null;
};

export type AuditLogRecord = {
  logId: number;
  eventType: string | null;
  employeeId: number | null;
  contentId: number | null;
  channel: string | null;
  outcome: string | null;
  reviewerDecision: string | null;
  createdAt: string;
  employee?: AuditLogEmployee | null;
};

export type AuditLogListResponse = {
  total: number;
  items: AuditLogRecord[];
};

export type AuditLogFilters = {
  search?: string;
  eventType?: string;
  employeeId?: string;
  contentId?: string;
  channel?: string;
  outcome?: string;
  reviewerDecision?: string;
  skip?: number;
  limit?: number;
};

function buildQueryParams(filters: AuditLogFilters) {
  const params = new URLSearchParams();

  const entries: Array<[string, string | number | undefined]> = [
    ["search", filters.search?.trim()],
    ["event_type", filters.eventType?.trim()],
    ["employee_id", filters.employeeId?.trim()],
    ["content_id", filters.contentId?.trim()],
    ["channel", filters.channel?.trim()],
    ["outcome", filters.outcome?.trim()],
    ["reviewer_decision", filters.reviewerDecision?.trim()],
    ["skip", filters.skip],
    ["limit", filters.limit],
  ];

  for (const [key, value] of entries) {
    if (value === undefined || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function getWithToken<T>(url: string, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

export async function getAuditLogs(token: string, filters: AuditLogFilters = {}) {
  return getWithToken<AuditLogListResponse>(`/api/audit/logs${buildQueryParams(filters)}`, token);
}

export async function exportAuditLogs(token: string, filters: AuditLogFilters = {}) {
  return getWithToken<AuditLogListResponse>(`/api/audit/export${buildQueryParams(filters)}`, token);
}