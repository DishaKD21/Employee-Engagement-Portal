"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Loader from "@/components/ui/Loader";
import { useAdminActions } from "@/modules/admin/hooks/useAdminActions";
import { validateCreateAccount } from "@/modules/admin/validations/adminValidation";
import { CREATABLE_ROLES } from "@/utils/roles";

const initialValues = {
  employeeId: "",
  email: "",
  password: "",
  role: "",
};

export default function CreateAccountForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const { handleCreateAccount } = useAdminActions();

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCreateAccount(values);
    setErrors(nextErrors);
    setSuccess("");
    setFormError("");

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await handleCreateAccount({
        employeeId: Number(values.employeeId),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });
      setSuccess("Account created successfully.");
      setValues(initialValues);
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Input name="employeeId" type="number" label="Employee ID" value={values.employeeId} onChange={onChange} error={errors.employeeId} placeholder="123" />
      <Input name="email" type="email" label="Email" value={values.email} onChange={onChange} error={errors.email} placeholder="new.user@company.com" />
      <Input name="password" type="password" label="Password" value={values.password} onChange={onChange} error={errors.password} placeholder="StrongPass123" />

      <Select name="role" label="Role" value={values.role} onChange={onChange} error={errors.role}>
        <option value="">Select role</option>
        {CREATABLE_ROLES.map((role) => (
          <option key={role} value={role}>{role}</option>
        ))}
      </Select>

      {formError ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{formError}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div> : null}

      <Button className="w-full" type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
      {loading ? <Loader label="Creating account" /> : null}
    </form>
  );
}
