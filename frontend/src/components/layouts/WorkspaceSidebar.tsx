"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  ChevronRight,
  FileText,
  LayoutGrid,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  SquareActivity,
  Users,
  BellRing,
  CalendarDays,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

type SidebarIcon = typeof LayoutGrid;

type SidebarItem = {
  label: string;
  href: string;
  icon: SidebarIcon;
};

type SidebarSection = {
  heading: string;
  items: SidebarItem[];
};

export type WorkspaceRole = "employee" | "hr" | "hr-manager";

type WorkspaceSidebarProps = {
  role: WorkspaceRole;
};

const sidebarConfig: Record<WorkspaceRole, { brandTitle: string; brandSubtitle: string; sections: SidebarSection[] }> = {
  employee: {
    brandTitle: "Wolf Pack",
    brandSubtitle: "aegis.ai",
    sections: [
      {
        heading: "MY WORKSPACE",
        items: [
          { label: "My Portal", href: "/employee/dashboard", icon: LayoutGrid },
          { label: "Active Survey", href: "/employee/surveys", icon: SquareActivity },
        ],
      },
      {
        heading: "HR HELP",
        items: [{ label: "HR Knowledge Base", href: "/employee/knowledge-base", icon: BookOpenText }],
      },
    ],
  },
  hr: {
    brandTitle: "Wolf Pack",
    brandSubtitle: "aegis.ai",
    sections: [
      {
        heading: "MANAGE",
        items: [
          { label: "Dashboard", href: "/hr/dashboard", icon: LayoutGrid },
          { label: "Events", href: "/hr/events", icon: CalendarDays },
          { label: "Surveys", href: "/hr/surveys", icon: MessageSquareText },
          { label: "Recognition Templates", href: "/hr/recognition-templates", icon: FileText },
        ],
      },
    ],
  },
  "hr-manager": {
    brandTitle: "Wolf Pack",
    brandSubtitle: "aegis.ai",
    sections: [
      {
        heading: "REVIEW",
        items: [
          { label: "Dashboard", href: "/hr-manager/dashboard", icon: LayoutGrid },
          { label: "Event Approvals", href: "/hr-manager/approvals", icon: CalendarDays },
          { label: "Survey Approvals", href: "/hr-manager/survey-approvals", icon: MessageSquareText },
          { label: "Template Approvals", href: "/hr-manager/template-approvals", icon: FileText },
        ],
      },
    ],
  },
};

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceSidebar({ role }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const authUser = useAuthStore((state) => state.user);
  const config = sidebarConfig[role];

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-slate-50/95 px-4 py-5 backdrop-blur xl:px-5">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200/70">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">{config.brandTitle}</p>
            <p className="text-xs text-slate-500">{config.brandSubtitle}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
        {config.sections.map((section) => (
          <div key={section.heading}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              {section.heading}
            </p>

            <div className="mt-2 space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActiveRoute(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                    ].join(" ")}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                          active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white",
                        ].join(" ")}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>

                    <ChevronRight className={active ? "h-4 w-4 text-white/80" : "h-4 w-4 text-slate-300"} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-violet-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {authUser?.name ?? (role === "hr" ? "HR Team" : role === "hr-manager" ? "HR Manager" : "Employee Profile")}
            </p>
            <p className="truncate text-xs text-slate-500">
              {role === "hr" ? "HR workspace" : role === "hr-manager" ? "HR manager workspace" : "Employee workspace"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}