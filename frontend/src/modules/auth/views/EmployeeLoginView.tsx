"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute, getErrorMessage } from "../services/auth.helpers";
import { loginEmployee } from "../services/employee-login.service";

const EmployeeLoginView = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      const token = response.token ?? "";
      const user = response.user ?? {
        email,
        role: resolvedRole,
      };

      setAuth({
        token,
        user,
        role: resolvedRole,
      });

      router.push(getDashboardRoute(resolvedRole));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Login failed. Please check your credentials."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="max-w-md mx-auto mt-10 p-6 border rounded shadow" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-center">Employee Login</h1>
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="email"
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
          Password:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          placeholder="Password"
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <label className="block text-sm font-medium text-gray-700" htmlFor="role">
          Role:
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          required
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="HR">HR</option>
          <option value="HR_MANAGER">HR_MANAGER</option>
          <option value="COMPLIANCE_REVIEWER">COMPLIANCE_REVIEWER</option>
        </select>
        {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 bg-blue-500 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  )
}

export default EmployeeLoginView
