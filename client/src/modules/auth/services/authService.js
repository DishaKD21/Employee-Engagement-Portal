import { createAccountApi, fetchCurrentAccount, loginApi } from "@/modules/auth/api/authApi";

export async function login(payload) {
  return loginApi(payload);
}

export async function getCurrentAccount() {
  return fetchCurrentAccount();
}

export async function createAccount(payload) {
  return createAccountApi(payload);
}
