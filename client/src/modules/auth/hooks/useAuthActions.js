"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { login } from "@/modules/auth/services/authService";
import { getDashboardPathForRole } from "@/utils/roles";

export function useAuthActions() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogin = async (payload) => {
    const result = await login(payload);
    setAuth({ token: result.token, user: result.user, role: result.user?.role });
    router.replace(getDashboardPathForRole(result.user?.role));
    return result;
  };

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return {
    handleLogin,
    handleLogout,
  };
}
