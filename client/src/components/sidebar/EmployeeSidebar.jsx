"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EMPLOYEE_NAV_ITEMS } from "@/utils/roles";

export default function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-6 border-r border-white/10 bg-slate-950/70 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Employee Portal</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Workspace</h2>
      </div>

      <nav className="space-y-2">
        {EMPLOYEE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        Real API data only. No mock widgets.
      </div>
    </aside>
  );
}
