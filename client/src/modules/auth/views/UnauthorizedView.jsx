import Link from "next/link";
import AuthPageShell from "@/modules/auth/components/AuthPageShell";

export default function UnauthorizedView({ role }) {
  return (
    <AuthPageShell
      eyebrow="Access restricted"
      title="This route is not available for your current workspace"
      subtitle={role ? `Authenticated role: ${role}` : "Your session is valid, but this route is blocked for your role."}
    >
      <div className="space-y-4 text-sm text-slate-300">
        <p>Use the correct role-specific dashboard route to continue.</p>
        <Link className="inline-flex rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300" href="/employee/dashboard">
          Go to Employee Dashboard
        </Link>
      </div>
    </AuthPageShell>
  );
}
