export const USER_ROLES = {
  EMPLOYEE: "EMPLOYEE",
  HR_COORDINATOR: "HR_COORDINATOR",
  HR_OPERATIONS_MANAGER: "HR_OPERATIONS_MANAGER",
  COMPLIANCE_REVIEWER: "COMPLIANCE_REVIEWER",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export const ROLE_DASHBOARD_PATHS = {
  [USER_ROLES.EMPLOYEE]: "/employee/dashboard",
  [USER_ROLES.HR_COORDINATOR]: "/hr/dashboard",
  [USER_ROLES.HR_OPERATIONS_MANAGER]: "/hr-operations/dashboard",
  [USER_ROLES.COMPLIANCE_REVIEWER]: "/compliance/dashboard",
  [USER_ROLES.SUPER_ADMIN]: "/admin/dashboard",
};

export const CREATABLE_ROLES = [
  USER_ROLES.EMPLOYEE,
  USER_ROLES.HR_COORDINATOR,
  USER_ROLES.HR_OPERATIONS_MANAGER,
  USER_ROLES.COMPLIANCE_REVIEWER,
];

export const ROLE_NAV_ITEMS = {
  [USER_ROLES.EMPLOYEE]: [
    { label: "Dashboard", href: "/employee/dashboard" },
    { label: "Profile", href: "/employee/profile" },
    { label: "Events", href: "/employee/events" },
    { label: "Surveys", href: "/employee/surveys" },
    { label: "Notifications", href: "/employee/notifications" },
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Create Account", href: "/admin/create-account" },
  ],
  [USER_ROLES.HR_COORDINATOR]: [{ label: "Dashboard", href: "/hr/dashboard" }],
  [USER_ROLES.HR_OPERATIONS_MANAGER]: [{ label: "Dashboard", href: "/hr-operations/dashboard" }],
  [USER_ROLES.COMPLIANCE_REVIEWER]: [{ label: "Dashboard", href: "/compliance/dashboard" }],
};

export const ROLE_LABELS = {
  [USER_ROLES.EMPLOYEE]: "Employee",
  [USER_ROLES.HR_COORDINATOR]: "HR Coordinator",
  [USER_ROLES.HR_OPERATIONS_MANAGER]: "HR Operations Manager",
  [USER_ROLES.COMPLIANCE_REVIEWER]: "Compliance Reviewer",
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
};

export function getDashboardPathForRole(role) {
  return ROLE_DASHBOARD_PATHS[role] || "/unauthorized";
}

export function isAllowedRole(role, allowedRoles = []) {
  return allowedRoles.includes(role);
}

export function getNavItemsForRole(role) {
  return ROLE_NAV_ITEMS[role] || [];
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || "Unknown";
}
