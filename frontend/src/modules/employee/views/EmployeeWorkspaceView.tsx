import Link from "next/link";
import { ArrowRight, BellRing, CalendarDays, MessageSquareText, SquareActivity } from "lucide-react";
import { SectionHeader } from "@/components/ui/enterprise";

const employeeQuickLinks = [
  { title: "Browse Events", href: "/employee/events", icon: CalendarDays },
  { title: "Active Survey", href: "/employee/surveys", icon: SquareActivity },
  { title: "Notifications", href: "/employee/notifications", icon: BellRing },
  { title: "HR Assistant", href: "/employee/knowledge-base", icon: MessageSquareText },
];

export default function EmployeeWorkspaceView() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Employee Workspace"
        title="Navigate employee features"
        description="Use the sidebar to move between the real employee routes already connected in the app."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {employeeQuickLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
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
    </div>
  );
}
