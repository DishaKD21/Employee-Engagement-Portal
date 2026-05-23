"use client";

import { createEmployeeAccount } from "@/modules/admin/services/adminService";

export function useAdminActions() {
  const handleCreateAccount = async (payload) => {
    return createEmployeeAccount(payload);
  };

  return { handleCreateAccount };
}
