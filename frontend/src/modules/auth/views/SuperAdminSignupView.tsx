"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getDashboardRoute, getErrorMessage } from "../services/auth.helpers";
import { signupSuperAdmin } from "../services/super-admin-signup.service";

const SuperAdminSignupView = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyName: formData.companyName.trim() || undefined,
      };

      const response = await signupSuperAdmin(payload);
      const role = response.role ?? response.user?.role ?? "SUPER_ADMIN";
      const token = response.token ?? "";
      const user = response.user ?? {
        name: payload.name,
        email: payload.email,
        role,
        companyName: payload.companyName,
      };

      setAuth({
        token,
        user,
        role,
      });

      router.push(getDashboardRoute(role));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Signup failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form className="p-4 max-w-md mx-auto bg-white rounded shadow space-y-4 mt-10" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-center">Super Admin Signup</h1>
        <label className="block text-sm font-medium text-gray-700" htmlFor="name">
          Full Name:
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Full Name"
          className="block w-full border text-shadow-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <label className="block text-sm font-medium text-gray-700" htmlFor="companyName">
          Company Name:
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Company Name (optional)"
          className="block w-full border text-shadow-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Email"
          className="block w-full border text-shadow-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
          Password:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          placeholder="Password"
          className="block w-full border text-shadow-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  )
}

export default SuperAdminSignupView
