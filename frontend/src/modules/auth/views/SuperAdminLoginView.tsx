"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute, getErrorMessage } from "../services/auth.helpers";
import { loginSuperAdmin } from "../services/super-admin-login.service";
import { EnterpriseButton, EnterpriseCard, EnterpriseInput, EnterpriseLabel, SectionHeader } from "@/components/ui/enterprise";
import { Loader } from "@mantine/core";

const SuperAdminLoginView = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const roleStore = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const response = await loginSuperAdmin({ email: email.trim(), password });
      const role = response.role ?? response.user?.role ?? "SUPER_ADMIN";
      const token = response.token ?? "";
      const user = response.user ?? {
        email,
        role,
      };

      setAuth({
        token,
        user,
        role,
      });

      router.push(getDashboardRoute(role));
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
        <SectionHeader eyebrow="Super Admin Access" title="Super Admin Login" description="Sign in to administer the platform." />
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
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/super-admin/signup"
              className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </EnterpriseCard>
    </div>
  );
};

export default SuperAdminLoginView;
