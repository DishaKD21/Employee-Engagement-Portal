import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function AdminDashboardView() {
  return (
    <div className="space-y-6">
      <Card
        title="Admin Control Center"
        subtitle="Manage account provisioning and role-based access from this module."
        action={<Badge tone="info">SUPER_ADMIN</Badge>}
      >
        <p className="text-sm text-slate-300">
          Use the sidebar to open <strong>Create Account</strong> and provision employees and HR users.
        </p>
      </Card>
    </div>
  );
}
