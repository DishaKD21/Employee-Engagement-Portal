import { CREATABLE_ROLES } from "@/utils/roles";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateCreateAccount(values) {
  const errors = {};

  if (!values.employeeId?.trim()) errors.employeeId = "Employee ID is required";
  else if (!Number.isInteger(Number(values.employeeId)) || Number(values.employeeId) <= 0) {
    errors.employeeId = "Employee ID must be a positive integer";
  }

  if (!values.email?.trim()) errors.email = "Email is required";
  else if (!isEmail(values.email.trim())) errors.email = "Enter a valid email";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 8) errors.password = "Password must be at least 8 characters";

  if (!values.role) errors.role = "Role is required";
  else if (!CREATABLE_ROLES.includes(values.role)) errors.role = "Invalid role";

  return errors;
}
