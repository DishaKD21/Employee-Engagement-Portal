function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateLogin(values) {
  const errors = {};

  if (!values.email?.trim()) errors.email = "Email is required";
  else if (!isEmail(values.email.trim())) errors.email = "Enter a valid email";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 8) errors.password = "Password must be at least 8 characters";

  return errors;
}
