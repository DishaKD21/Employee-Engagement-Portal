import { WorkspaceHeader } from "@/components/layouts/WorkspaceHeader";

type EmployeeHeaderProps = {
  title: string;
  description: string;
};

export function EmployeeHeader({ title, description }: EmployeeHeaderProps) {
  return <WorkspaceHeader title={title} description={description} />;
}