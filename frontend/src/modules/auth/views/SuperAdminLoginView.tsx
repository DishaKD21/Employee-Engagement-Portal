"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute, getErrorMessage } from "../services/auth.helpers";
import { loginSuperAdmin } from "../services/super-admin-login.service";
import { EnterpriseButton, EnterpriseCard, EnterpriseInput, EnterpriseLabel, SectionHeader } from "@/components/ui/enterprise";

const SuperAdminLoginView = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      </EnterpriseCard>
    </div>
  )
}

export default SuperAdminLoginView
