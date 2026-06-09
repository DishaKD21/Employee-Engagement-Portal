"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute, getErrorMessage } from "../services/auth.helpers";
import { loginEmployee } from "../services/employee-login.service";
import { EnterpriseButton, EnterpriseCard, EnterpriseInput, EnterpriseLabel, SectionHeader } from "@/components/ui/enterprise";
import { Loader } from "@mantine/core";

function EmployeeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";

  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const roleStore = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated && token && user) {
      router.replace(getDashboardRoute(roleStore));
    }
  }, [isHydrated, isAuthenticated, token, user, roleStore, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginEmployee({
        email: email.trim(),
        password,
        role: role.trim() || undefined,
      });
      const resolvedRole = response.role ?? response.user?.role ?? role;
      const responseToken = response.token ?? "";
      const responseUser = response.user ?? {
        email,
        role: resolvedRole,
      };

      setAuth({
        token: responseToken,
        user: responseUser,
        role: resolvedRole,
      });

      router.push(getDashboardRoute(resolvedRole));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Login failed. Please check your credentials."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.08),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader size="xl" variant="dots" color="blue" />
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.08),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-10">
      <EnterpriseCard className="w-full max-w-md p-8">
        <SectionHeader eyebrow="Employee Access" title="Employee Login" description="Sign in to access your HR workspace and services." />
        
        {isExpired && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-medium">
            Your session has expired. Please login again.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <EnterpriseLabel htmlFor="email">Email</EnterpriseLabel>
            <EnterpriseInput
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="email"
            />
          </div>
          <div className="space-y-2">
            <EnterpriseLabel htmlFor="password">Password</EnterpriseLabel>
            <EnterpriseInput
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              placeholder="Password"
            />
          </div>
          <div className="space-y-2">
            <EnterpriseLabel htmlFor="role">Role</EnterpriseLabel>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="HR">HR</option>
              <option value="HR_MANAGER">HR_MANAGER</option>
              <option value="COMPLIANCE_REVIEWER">COMPLIANCE_REVIEWER</option>
            </select>
          </div>
          {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}
          <EnterpriseButton
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="mt-2 w-full"
          >
            {isLoading ? "Logging in..." : "Login"}
          </EnterpriseButton>
        </form>
      </EnterpriseCard>
    </div>
  );
}

export function EmployeeLoginView() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.08),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
        <Loader size="xl" variant="dots" color="blue" />
      </div>
    }>
      <EmployeeLoginForm />
    </Suspense>
  );
}

export default EmployeeLoginView;
