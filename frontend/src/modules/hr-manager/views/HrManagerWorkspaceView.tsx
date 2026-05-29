import Link from "next/link";
import { ArrowRight, BookOpenText, CheckCircle2, FileText, ShieldCheck, SquareActivity } from "lucide-react";

const hrManagerLinks = [
  { title: "Knowledge Base Approvals", href: "/hr-manager/knowledge-base-approvals", icon: BookOpenText },
  { title: "Event Approvals", href: "/hr-manager/approvals", icon: CheckCircle2 },
  { title: "Survey Approvals", href: "/hr-manager/survey-approvals", icon: SquareActivity },
  { title: "Template Approvals", href: "/hr-manager/template-approvals", icon: FileText },
];

export default function HrManagerWorkspaceView() {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">HR Manager Workspace</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Review approvals from the real workflow routes</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Use the sidebar to move between approval queues. The cards below only link to pages that already exist.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hrManagerLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={`${item.href}-${item.title}`}
              href={item.href}
              className="group flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-violet-200 hover:bg-white hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200/70">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-slate-900">{item.title}</span>
              </span>
              <ArrowRight className="h-4.5 w-4.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-600" />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
          Approval-only access
        </div>
        <p className="mt-2 leading-6">
          This workspace only routes into the existing approval pages. No invented approvals or fake queue content is shown here.
        </p>
      </div>
    </section>
  );
}