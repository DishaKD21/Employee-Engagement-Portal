"use client";

import { usePathname } from "next/navigation";
import { BellRing, CircleCheckBig, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

type WorkspaceHeaderProps = {
  title: string;
  description: string;
};

export function WorkspaceHeader({ title, description }: WorkspaceHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur xl:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">Workspace View</p>
            <h1 className="mt-1 text-[32px] font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <BellRing className="h-4.5 w-4.5 text-slate-500" />
            <span>Notifications</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 hover:bg-white">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          {breadcrumbs.map((segment, index) => {
            const href = `/${breadcrumbs.slice(0, index + 1).join("/")}`;

            return (
              <div key={href} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <Link href={href} className="rounded-full px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900">
                  {segment.replace(/-/g, " ")}
                </Link>
              </div>
            );
          })}
          <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
            <CircleCheckBig className="h-4.5 w-4.5" />
            <span className="truncate">Operational</span>
          </div>
        </div>
      </div>
    </header>
  );
}