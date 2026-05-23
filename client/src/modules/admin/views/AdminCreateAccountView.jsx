import Card from "@/components/ui/Card";
import CreateAccountForm from "@/modules/admin/components/CreateAccountForm";

export default function AdminCreateAccountView() {
  return (
    <Card
      title="Create Employee Account"
      subtitle="Only SUPER_ADMIN can create accounts. This calls POST /api/v1/auth/create-account with Bearer token."
      className="max-w-2xl"
    >
      <CreateAccountForm />
    </Card>
  );
}
