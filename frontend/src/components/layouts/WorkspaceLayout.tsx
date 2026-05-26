"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { WorkspaceHeader } from "@/components/layouts/WorkspaceHeader";
import { WorkspaceSidebar, type WorkspaceRole } from "@/components/layouts/WorkspaceSidebar";

type WorkspaceLayoutProps = {
  role: WorkspaceRole;
  children: ReactNode;
};

const pageMeta: Record<string, Record<string, { title: string; description: string }>> = {
  employee: {
    "/employee/dashboard": {
      title: "My Portal",
      description: "Your central hub for events, surveys, notifications, and HR support content.",
    },
    "/employee/surveys": {
      title: "Active Survey",
      description: "Review live surveys and submit responses from a single workspace.",
    },
    "/employee/knowledge-base": {
      title: "HR Knowledge Base",
      description: "Browse policy articles and support content already published for employees.",
    },
    "/employee/events": {
      title: "Employee Events",
      description: "Track published employee events and registration opportunities.",
    },
    "/employee/notifications": {
      title: "Notifications",
      description: "Review recognition, survey, and system notifications in one place.",
    },
  },
  hr: {
    "/hr/dashboard": {
      title: "HR Dashboard",
      description: "Create engagement content and manage the approval pipeline from one place.",
    },
    "/hr/events": {
      title: "Events",
      description: "Build engagement events and submit them for review before publishing.",
    },
    "/hr/surveys": {
      title: "Surveys",
      description: "Author survey forms and route them through the approval workflow.",
    },
    "/hr/recognition-templates": {
      title: "Recognition Templates",
      description: "Compose recognition templates for birthdays and anniversaries, then submit for approval.",
    },
  },
  "hr-manager": {
    "/hr-manager/dashboard": {
      title: "HR Manager Dashboard",
      description: "Review employee submissions before they reach the workforce.",
    },
    "/hr-manager/approvals": {
      title: "Event Approvals",
      description: "Approve or reject submitted engagement event workflows.",
    },
    "/hr-manager/survey-approvals": {
      title: "Survey Approvals",
      description: "Review submitted surveys before they are published to employees.",
    },
    "/hr-manager/template-approvals": {
      title: "Template Approvals",
      description: "Review recognition templates before they go live.",
    },
  },
};

export function WorkspaceLayout({ role, children }: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const meta = pageMeta[role][pathname] ?? {
    title: role === "hr" ? "HR Workspace" : role === "hr-manager" ? "HR Manager Workspace" : "Employee Workspace",
    description:
      role === "hr"
        ? "Modern HRMS workspace for HR operations."
        : role === "hr-manager"
          ? "Modern approval workspace for HR managers."
          : "Modern HRMS experience for employees.",
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <div className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <WorkspaceSidebar role={role} />
        </div>

        <div className="flex min-h-screen min-w-0 flex-col">
          <WorkspaceHeader title={meta.title} description={meta.description} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}