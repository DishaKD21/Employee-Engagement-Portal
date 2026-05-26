import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/components/layouts/WorkspaceLayout";

export default function EmployeeRouteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <WorkspaceLayout role="employee">{children}</WorkspaceLayout>;
}