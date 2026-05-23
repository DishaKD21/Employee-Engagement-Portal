import {
  fetchEmployeeEvents,
  fetchEmployeeNotifications,
  fetchEmployeeProfile,
  fetchEmployeeSurveys,
  updateEmployeeProfile,
} from "@/modules/employee/api/employeeApi";

export async function getEmployeeDashboardData() {
  const [profile, events, surveys, notifications] = await Promise.all([
    fetchEmployeeProfile(),
    fetchEmployeeEvents(),
    fetchEmployeeSurveys(),
    fetchEmployeeNotifications(),
  ]);

  return { profile, events, surveys, notifications };
}

export async function getEmployeeProfile() {
  return fetchEmployeeProfile();
}

export async function saveEmployeeProfile(payload) {
  return updateEmployeeProfile(payload);
}

export async function getEmployeeEvents() {
  return fetchEmployeeEvents();
}

export async function getEmployeeSurveys() {
  return fetchEmployeeSurveys();
}

export async function getEmployeeNotifications() {
  return fetchEmployeeNotifications();
}
