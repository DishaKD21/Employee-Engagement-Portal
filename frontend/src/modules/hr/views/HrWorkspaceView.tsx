import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, SquareActivity, Users } from "lucide-react";

const hrQuickLinks = [
  { title: "Manage Events", href: "/hr/events", icon: CalendarDays },
  { title: "Manage Surveys", href: "/hr/surveys", icon: SquareActivity },
  { title: "Recognition Templates", href: "/hr/recognition-templates", icon: FileText },
  { title: "People & Approvals", href: "/hr/events", icon: Users },
];

export default function HrWorkspaceView() {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">HR Workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Use the real HR routes already wired in the app</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Jump straight into the existing event, survey, and recognition template flows from here.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {hrQuickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
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
      </section>
    </div>
  );
}