"use client";

import { usePathname } from "next/navigation";
import { CircleCheckBig } from "lucide-react";

type WorkspaceHeaderProps = {
  title: string;
  description: string;
};

export function WorkspaceHeader({ title, description }: WorkspaceHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur xl:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">Workspace View</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-600">
          <CircleCheckBig className="h-4.5 w-4.5 text-emerald-600" />
          <span className="truncate">{pathname}</span>
        </div>
      </div>
    </header>
  );
}