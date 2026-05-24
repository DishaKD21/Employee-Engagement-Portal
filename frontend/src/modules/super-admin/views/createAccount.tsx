"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { createEmployeeAccount } from "../services/create-account.service";

const CreateAccount = () => {
  const token = useAuthStore((state) => state.token);
  const [employeeName, setEmployeeName] = useState("");
  const [role, setRole] = useState("EMPLOYEE");

  const [generatedEmployeeId, setGeneratedEmployeeId] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [emailWarning, setEmailWarning] = useState("");

  const [isCreated, setIsCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage("Please sign in again before creating an employee account.");
      return;
    }

    setIsLoading(true);
    setIsCreated(false);
    setErrorMessage("");
    setEmailWarning("");

    try {
      const response = await createEmployeeAccount(
        {
          employeeName: employeeName.trim(),
          role: role as "EMPLOYEE" | "HR" | "HR_MANAGER" | "COMPLIANCE_REVIEWER",
        },
        token,
      );

      setGeneratedEmployeeId(response.employeeId);
      setGeneratedEmail(response.email);
      setGeneratedPassword(response.temporaryPassword);
      setEmailWarning(response.emailWarning ?? "");
      setIsCreated(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create employee account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black text-center mb-2">
          Create Employee Account
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Super Admin can create employee accounts here
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Employee Name
            </label>

            <input
              type="text"
              placeholder="Enter employee full name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Select Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="HR">HR</option>
              <option value="HR_MANAGER">HR_MANAGER</option>
              <option value="COMPLIANCE_REVIEWER">
                COMPLIANCE_REVIEWER
              </option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-white font-semibold py-3 rounded-lg"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {errorMessage ? (
          <div className="mt-6 border border-red-200 bg-red-50 rounded-xl p-4 text-red-700 text-sm">
            {errorMessage}
          </div>
        ) : null}

        {/* Generated Credentials */}
        {isCreated && (
          <div className="mt-8 border border-green-200 bg-green-50 rounded-xl p-5">
            <h2 className="text-xl font-semibold text-green-700 mb-4">
              Employee Account Created Successfully
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">
                  Employee ID
                </p>

                <p className="text-black font-semibold">
                  {generatedEmployeeId}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Company Email
                </p>

                <p className="text-black font-semibold">
                  {generatedEmail}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Credentials Sent
                </p>

                <p className="text-black font-semibold">
                  {generatedPassword}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Assigned Role
                </p>

                <p className="text-black font-semibold">
                  {role}
                </p>
              </div>
            </div>

            <div className="mt-5 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                {emailWarning || "The employee received the generated credentials using Nodemailer."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;