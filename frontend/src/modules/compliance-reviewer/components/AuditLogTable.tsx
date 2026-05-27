"use client";

import React from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, FileText, ShieldAlert } from "lucide-react";
import type { AuditLogRecord } from "../services/audit.service";

type Props = {
  logs: AuditLogRecord[];
  loading: boolean;
};

const outcomeTone: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  created: "bg-sky-50 text-sky-700 border-sky-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  delivered: "bg-cyan-50 text-cyan-700 border-cyan-200",
  failed: "bg-amber-50 text-amber-700 border-amber-200",
};

const iconByOutcome: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  created: FileText,
  approved: CheckCircle2,
  rejected: ShieldAlert,
  delivered: ArrowUpRight,
  failed: AlertCircle,
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toneFor(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return outcomeTone[normalized] ?? "bg-slate-100 text-slate-600 border-slate-200";
}

function initials(value?: string | null) {
  if (!value) return "--";
  const parts = value.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("").padEnd(2, "-");
}

function logTitle(log: AuditLogRecord) {
  return log.eventType ?? "Audit Event";
}

export default function AuditLogTable({ logs, loading }: Props) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Event Log — Most Recent First</h2>
          <p className="mt-1 text-sm text-slate-500">Immutable audit trail, ordered by newest platform activity.</p>
        </div>
        <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 md:inline-flex">
          Append-only
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">Loading audit logs...</div>
        ) : null}

        {!loading && !logs.length ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">No audit logs match the current filters.</div>
        ) : null}

        {!loading
          ? logs.map((log) => {
              const tone = toneFor(log.outcome ?? log.eventType);
              const key = (log.outcome ?? log.eventType ?? "").trim().toLowerCase();
              const Icon = iconByOutcome[key] ?? Clock3;

              return (
                <article key={log.logId} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{logTitle(log)}</h3>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
                          {log.outcome ?? "Recorded"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        EMP-{String(log.employeeId ?? log.employee?.employeeId ?? "-")}
                        {log.employee?.name ? ` • ${log.employee.name}` : ""}
                        {log.employee?.email ? ` • ${log.employee.email}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Content ID: {log.contentId ?? "-"} • Channel: {log.channel ?? "-"}
                        {log.reviewerDecision ? ` • Reviewer Decision: ${log.reviewerDecision}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start lg:self-auto">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Log ID</p>
                      <p className="text-sm font-semibold text-slate-800">{log.logId}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Created</p>
                      <p className="text-sm font-semibold text-slate-800">{formatDateTime(log.createdAt)}</p>
                    </div>
                    <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-violet-200/60 md:flex">
                      {initials(log.eventType)}
                    </div>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </div>
  );
}