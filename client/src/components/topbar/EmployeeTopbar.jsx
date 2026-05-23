"use client";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { useAuthActions } from "@/modules/auth/hooks/useAuthActions";

export default function EmployeeTopbar({ title }) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const { handleLogout } = useAuthActions();

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/50 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{role || "Employee"}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Badge tone="info">{user?.email || "Signed in"}</Badge>
        <Button variant="secondary" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}
