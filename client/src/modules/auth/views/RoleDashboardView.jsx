import Card from "@/components/ui/Card";

export default function RoleDashboardView({ roleTitle }) {
  return (
    <Card
      title={`${roleTitle} Dashboard`}
      subtitle="This workspace is authenticated and role-routed."
    >
      <p className="text-sm text-slate-300">
        Core authentication and routing are active. Employee module and admin account provisioning are fully integrated.
      </p>
    </Card>
  );
}
