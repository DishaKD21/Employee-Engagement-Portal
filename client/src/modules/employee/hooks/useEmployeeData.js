"use client";

import { useApiState } from "@/hooks/useApiState";
import {
  getEmployeeDashboardData,
  getEmployeeEvents,
  getEmployeeNotifications,
  getEmployeeProfile,
  getEmployeeSurveys,
  saveEmployeeProfile,
} from "@/modules/employee/services/employeeService";

export function useEmployeeDashboardData() {
  return useApiState(getEmployeeDashboardData);
}

export function useEmployeeProfileData() {
  return useApiState(getEmployeeProfile);
}

export function useEmployeeEventsData() {
  return useApiState(getEmployeeEvents);
}

export function useEmployeeSurveysData() {
  return useApiState(getEmployeeSurveys);
}

export function useEmployeeNotificationsData() {
  return useApiState(getEmployeeNotifications);
}

export async function updateEmployeeProfileData(payload) {
  return saveEmployeeProfile(payload);
}
