import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, ShieldCheck, SquareActivity } from "lucide-react";

const entryPoints = [
  { href: "/employee/dashboard", label: "Employee workspace", icon: SquareActivity },
  { href: "/hr/dashboard", label: "HR workspace", icon: CalendarDays },
  { href: "/hr-manager/dashboard", label: "HR manager workspace", icon: ShieldCheck },
  { href: "/compliance-reviewer/dashboard", label: "Compliance review", icon: BookOpenText },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.10),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-10 text-slate-900 sm:px-8 lg:px-10">
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:gap-8">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">Enterprise HR Platform</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[32px]">Employee Engagement Portal</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Access the existing employee, HR, approval, and compliance workflows through a modern enterprise shell.
              </p>
            </div>

            <div className="grid gap-4 p-6 sm:p-8 sm:grid-cols-2">
              {entryPoints.map((entry) => {
                const Icon = entry.icon;

                return (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-blue-200 hover:bg-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{entry.label}</span>
                    </span>
                    <ArrowRight className="h-4.5 w-4.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Design system</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Professional enterprise UI</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Consistent spacing, restrained color, and dense-but-readable layouts tuned for HR operations.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ["Primary", "#1E40AF"],
                ["Background", "#F8FAFC"],
                ["Surface", "#FFFFFF"],
                ["Border", "#E2E8F0"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
