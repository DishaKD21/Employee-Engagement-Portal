// Minimal auth-related types for login/signup flows
export type LoginInput = {
  email: string;
  password: string;
};

export type EmployeeLoginInput = LoginInput & {
  role?: string; // optional role string from frontend
};

export type SuperAdminSignupInput = {
  name: string;
  email: string;
  password: string;
  companyName?: string;
};
