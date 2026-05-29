"use client";

import { useEffect, useState } from "react";
import { fetchEscalations } from "@/lib/api-client";

type EscalationEntry = {
  id: number;
  status: string | null;
  resolutionText: string | null;
  query?: {
    queryText: string | null;
    confidenceScore: number | null;
  } | null;
};

export default function QueryEscalationDashboardView() {
  const [escalations, setEscalations] = useState<EscalationEntry[]>([]);

  useEffect(() => {
    void (async () => {
      const response = await fetchEscalations();
      setEscalations(response);
    })();
  }, []);

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">Escalation Dashboard</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Low-confidence chatbot queries</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Queries below the confidence threshold appear here for HR review and manual resolution.
      </p>

      <div className="mt-5 space-y-3">
        {escalations.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{item.query?.queryText}</p>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Resolution: {item.resolutionText ?? "Awaiting HR resolution"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}