import { createAccountApi } from "@/modules/admin/api/adminApi";

export async function createEmployeeAccount(payload) {
  return createAccountApi(payload);
}
