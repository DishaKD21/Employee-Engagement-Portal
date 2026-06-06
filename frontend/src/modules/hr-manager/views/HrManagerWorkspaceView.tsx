import Link from "next/link";
import { ArrowRight, BookOpenText, CheckCircle2, FileText, ShieldCheck, SquareActivity } from "lucide-react";
import { EnterpriseCard, SectionHeader } from "@/components/ui/enterprise";

const hrManagerLinks = [
  { title: "Knowledge Base Approvals", href: "/hr-manager/knowledge-base-approvals", icon: BookOpenText },
  { title: "Event Approvals", href: "/hr-manager/approvals", icon: CheckCircle2 },
  { title: "Survey Approvals", href: "/hr-manager/survey-approvals", icon: SquareActivity },
  { title: "Template Approvals", href: "/hr-manager/template-approvals", icon: FileText },
];

export default function HrManagerWorkspaceView() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="HR Manager Workspace"
        title="Review approvals from the real workflow routes"
        description="Use the sidebar to move between approval queues. The cards below only link to pages that already exist."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {hrManagerLinks.map((item) => {
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
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
          Approval-only access
        </div>
        <p className="mt-2 leading-6">
          This workspace only routes into the existing approval pages. No invented approvals or fake queue content is shown here.
        </p>
      </EnterpriseCard>
    </div>
  );
}