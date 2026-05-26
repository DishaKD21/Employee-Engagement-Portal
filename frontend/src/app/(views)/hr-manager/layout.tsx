import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/components/layouts/WorkspaceLayout";

export default function HrManagerRouteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <WorkspaceLayout role="hr-manager">{children}</WorkspaceLayout>;
}