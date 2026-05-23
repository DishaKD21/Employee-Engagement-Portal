import { request, unwrapApiResponse } from "@/lib/api-client";

const API_V1 = "/api/v1";

export async function fetchEmployeeProfile() {
  const response = await request("get", `${API_V1}/employees/me`);
  return unwrapApiResponse(response);
}

export async function updateEmployeeProfile(payload) {
  const response = await request("patch", `${API_V1}/employees/me`, payload);
  return unwrapApiResponse(response);
}

export async function fetchEmployeeEvents() {
  const response = await request("get", `${API_V1}/employees/events`);
  return unwrapApiResponse(response);
}

export async function fetchEmployeeSurveys() {
  const response = await request("get", `${API_V1}/employees/surveys`);
  return unwrapApiResponse(response);
}

export async function fetchEmployeeNotifications() {
  const response = await request("get", `${API_V1}/employees/notifications`);
  return unwrapApiResponse(response);
}
