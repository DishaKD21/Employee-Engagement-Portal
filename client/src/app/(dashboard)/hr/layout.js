import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { USER_ROLES } from "@/utils/roles";

export default function Layout({ children }) {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.HR_COORDINATOR]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
