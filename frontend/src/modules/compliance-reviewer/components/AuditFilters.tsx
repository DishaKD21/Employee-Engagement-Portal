"use client";

import React from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import type { AuditLogFilters } from "../services/audit.service";

type Props = {
  filters: AuditLogFilters;
  onChange: (next: AuditLogFilters) => void;
  onReset: () => void;
  onExport: () => void;
  exporting: boolean;
};

const EVENT_TYPE_OPTIONS = [
  "Login Success",
  "Event Created",
  "Event Approved",
  "Event Rejected",
  "Survey Created",
  "Survey Approved",
  "Survey Rejected",
  "Recognition Delivered",
  "Recognition Delivery Failed",
  "Recognition Approved",
  "Recognition Rejected",
  "Content Rejected",
  "Query Escalated",
  "Approval Completed",
];

const OUTCOME_OPTIONS = ["Success", "Created", "Approved", "Rejected", "Delivered", "Failed"];
const CHANNEL_OPTIONS = ["AUTH", "EVENT", "SURVEY", "RECOGNITION", "NOTIFICATION", "APPROVAL"];

function baseButtonClass(active?: boolean) {
  return [
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
    active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  ].join(" ");
}

export default function AuditFilters({ filters, onChange, onReset, onExport, exporting }: Props) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 shadow-inner">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <input
            value={filters.search ?? ""}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            type="search"
            placeholder="Search by employee ID, event type, content ID..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onReset} className={baseButtonClass()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </button>
          <button type="button" onClick={onExport} disabled={exporting} className={baseButtonClass(true)}>
            <Filter className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Event Type</span>
          <select
            value={filters.eventType ?? ""}
            onChange={(event) => onChange({ ...filters, eventType: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          >
            <option value="">All Types</option>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Outcome</span>
          <select
            value={filters.outcome ?? ""}
            onChange={(event) => onChange({ ...filters, outcome: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          >
            <option value="">All Outcomes</option>
            {OUTCOME_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Channel</span>
          <select
            value={filters.channel ?? ""}
            onChange={(event) => onChange({ ...filters, channel: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
          >
            <option value="">All Channels</option>
            {CHANNEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Content ID</span>
          <input
            value={filters.contentId ?? ""}
            onChange={(event) => onChange({ ...filters, contentId: event.target.value })}
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2816"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400"
          />
        </label>
      </div>
    </div>
  );
}