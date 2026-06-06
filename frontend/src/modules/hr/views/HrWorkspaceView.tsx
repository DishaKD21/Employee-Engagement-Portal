import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, SquareActivity, Users } from "lucide-react";
import { EnterpriseCard, SectionHeader } from "@/components/ui/enterprise";

const hrQuickLinks = [
  { title: "Manage Events", href: "/hr/events", icon: CalendarDays },
  { title: "Manage Surveys", href: "/hr/surveys", icon: SquareActivity },
  { title: "Recognition Templates", href: "/hr/recognition-templates", icon: FileText },
  { title: "People & Approvals", href: "/hr/events", icon: Users },
];

export default function HrWorkspaceView() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="HR Workspace"
        title="Use the real HR routes already wired in the app"
        description="Jump straight into the existing event, survey, and recognition template flows from here."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {hrQuickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={`${item.href}-${item.title}`}
              href={item.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 transition hover:border-blue-200 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-slate-900">{item.title}</span>
              </span>
              <ArrowRight className="h-4.5 w-4.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
            </Link>
          );
        })}
      </div>

      <EnterpriseCard className="p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Users className="h-4.5 w-4.5 text-blue-700" />
          HR operations overview
        </div>
        <p className="mt-2 leading-6">Workspace shortcuts point to the existing routes only, with no invented workflows or dead ends.</p>
      </EnterpriseCard>
    </div>
  );
}