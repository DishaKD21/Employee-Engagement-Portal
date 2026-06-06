"use client";

import React from "react";
import { Checkbox } from "@mantine/core";
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, FileText, ShieldAlert } from "lucide-react";
import type { AuditLogRecord } from "../services/audit.service";
import { DataTableShell, DataViewport, EmptyState, EnterpriseBadge } from "@/components/ui/enterprise";
import { useRowSelection } from "@/hooks/useRowSelection";

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
  const selection = useRowSelection(logs.map((log) => log.logId));

  return (
    <DataTableShell className="p-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Event Log</h2>
          <p className="mt-1 text-sm text-slate-500">Immutable audit trail, ordered by newest platform activity.</p>
        </div>
        <EnterpriseBadge tone="success">Append-only</EnterpriseBadge>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-4 text-sm text-slate-600">
        <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
        <span>{selection.selectedCount} items selected</span>
        {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
      </div>

      <DataViewport height={620}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-[1] bg-slate-50 text-[14px] font-semibold text-slate-600">
            <tr>
              <th className="w-12 px-5 py-3 font-semibold"></th>
              <th className="px-5 py-3 font-semibold">Event</th>
              <th className="px-5 py-3 font-semibold">Employee</th>
              <th className="px-5 py-3 font-semibold">Content</th>
              <th className="px-5 py-3 font-semibold">Channel</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-500">
                  Loading audit logs...
                </td>
              </tr>
            ) : null}

            {!loading && !logs.length ? (
              <tr>
                <td colSpan={7} className="px-5 py-16">
                  <EmptyState title="No audit logs found." description="Audit logs matching the active search and filters will appear here." />
                </td>
              </tr>
            ) : null}

            {!loading
              ? logs.map((log) => {
                  const tone = toneFor(log.outcome ?? log.eventType);
                  const key = (log.outcome ?? log.eventType ?? "").trim().toLowerCase();
                  const Icon = iconByOutcome[key] ?? Clock3;

                  return (
                    <tr key={log.logId} className="group hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <Checkbox checked={selection.selectedSet.has(log.logId)} onChange={() => selection.toggleOne(log.logId)} aria-label={`Select audit log ${log.logId}`} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{logTitle(log)}</p>
                            <p className="mt-1 text-xs text-slate-500">Log #{log.logId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">EMP-{String(log.employeeId ?? log.employee?.employeeId ?? "-")}</p>
                          <p className="text-xs text-slate-500">{log.employee?.name ?? "Unassigned employee"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        <p className="font-medium text-slate-900">{log.contentId ?? "-"}</p>
                        <p className="text-xs text-slate-500">{log.reviewerDecision ? `Reviewer: ${log.reviewerDecision}` : "No reviewer decision"}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{log.channel ?? "-"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{log.outcome ?? "Recorded"}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
      </DataViewport>
    </DataTableShell>
  );
}
