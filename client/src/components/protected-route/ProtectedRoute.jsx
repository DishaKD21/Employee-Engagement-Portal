"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";
import { isAllowedRole } from "@/utils/roles";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (allowedRoles.length > 0 && !isAllowedRole(role, allowedRoles)) {
      router.replace("/unauthorized");
    }
  }, [allowedRoles, hasHydrated, pathname, role, router, token]);

  if (!hasHydrated) {
    return <div className="grid-shell flex min-h-screen items-center justify-center p-6"><Loader label="Restoring session" /></div>;
  }

  if (!token) {
    return <div className="grid-shell flex min-h-screen items-center justify-center p-6"><Loader label="Redirecting to sign in" /></div>;
  }

  if (allowedRoles.length > 0 && !isAllowedRole(role, allowedRoles)) {
    return <div className="grid-shell flex min-h-screen items-center justify-center p-6"><Loader label="Checking access" /></div>;
  }

  return children;
}
