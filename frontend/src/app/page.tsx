"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute } from "@/modules/auth/services/auth.helpers";
import { Loader } from "@mantine/core";

export default function Home() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && token && user) {
      router.replace(getDashboardRoute(role));
    } else {
      router.replace("/employee/login");
    }
  }, [isHydrated, isAuthenticated, token, user, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.08),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader size="xl" variant="dots" color="blue" />
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase animate-pulse">
          Routing session...
        </p>
      </div>
    </div>
  );
}
