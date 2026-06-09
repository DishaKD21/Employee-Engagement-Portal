"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute } from "@/modules/auth/services/auth.helpers";
import { Loader } from "@mantine/core";

export default function ProtectedViewsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // 1. Authentication Check
    if (!isAuthenticated || !token || !user) {
      setIsAuthorized(false);
      if (pathname.startsWith("/super-admin")) {
        router.replace("/super-admin/login");
      } else {
        router.replace("/employee/login");
      }
      return;
    }

    // 2. Role-Based Access Control (RBAC) Check
    const normalizedUserRole = role ? role.trim().toUpperCase().replace(/\s+/g, "_") : "";

    let allowed = false;

    if (normalizedUserRole === "EMPLOYEE") {
      if (pathname.startsWith("/employee")) {
        allowed = true;
      }
    } else if (normalizedUserRole === "HR") {
      if (pathname.startsWith("/hr")) {
        allowed = true;
      }
    } else if (normalizedUserRole === "HR_MANAGER") {
      if (pathname.startsWith("/hr-manager")) {
        allowed = true;
      }
    } else if (normalizedUserRole === "COMPLIANCE_REVIEWER" || normalizedUserRole === "COMPLIANCE-REVIEWER") {
      if (pathname.startsWith("/compliance-reviewer")) {
        allowed = true;
      }
    } else if (normalizedUserRole === "SUPER_ADMIN") {
      if (pathname.startsWith("/super-admin")) {
        allowed = true;
      }
    }

    if (!allowed) {
      setIsAuthorized(false);
      // Redirect to their allowed dashboard route
      const fallbackRoute = getDashboardRoute(role);
      router.replace(fallbackRoute);
    } else {
      setIsAuthorized(true);
    }
  }, [isHydrated, isAuthenticated, token, user, role, pathname, router]);

  // While hydrating/checking auth, show loader to prevent flashes
  if (!isHydrated || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.08),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader size="xl" variant="dots" color="blue" />
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase animate-pulse">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
