"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import AuthPageShell from "@/modules/auth/components/AuthPageShell";
import { useAuthActions } from "@/modules/auth/hooks/useAuthActions";
import { validateLogin } from "@/modules/auth/validations/authValidation";

const initialValues = { email: "", password: "" };

export default function LoginView() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleLogin } = useAuthActions();

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setFormError("");
    setLoading(true);

    try {
      await handleLogin({
        email: values.email.trim(),
        password: values.password,
      });
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      subtitle="Use your employee or HR account to access the platform."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <Input name="email" type="email" label="Email" placeholder="you@company.com" value={values.email} onChange={onChange} error={errors.email} />
        <Input name="password" type="password" label="Password" placeholder="Enter your password" value={values.password} onChange={onChange} error={errors.password} />

        {formError ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{formError}</div> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>

        {loading ? <Loader label="Authenticating session" /> : null}

        <p className="text-sm text-slate-400">
          Account creation is managed by SUPER_ADMIN from the admin console.
        </p>
      </form>
    </AuthPageShell>
  );
}
