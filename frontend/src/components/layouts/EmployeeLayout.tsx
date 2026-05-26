import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/components/layouts/WorkspaceLayout";

type EmployeeLayoutProps = {
  children: ReactNode;
};

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return <WorkspaceLayout role="employee">{children}</WorkspaceLayout>;
}