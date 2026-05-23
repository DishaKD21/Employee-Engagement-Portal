"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardPathForRole } from "@/utils/roles";

export default function AuthLayout({ children }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && token) {
      router.replace(getDashboardPathForRole(role));
    }
  }, [hasHydrated, role, router, token]);

  return children;
}
