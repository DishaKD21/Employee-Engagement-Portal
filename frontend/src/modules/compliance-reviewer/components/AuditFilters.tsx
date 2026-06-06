"use client";

import React from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import type { AuditLogFilters } from "../services/audit.service";
import { EnterpriseButton, EnterpriseInput, EnterpriseSelect } from "@/components/ui/enterprise";

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
  return active ? "primary" : "secondary";
}

export default function AuditFilters({ filters, onChange, onReset, onExport, exporting }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <EnterpriseInput
            value={filters.search ?? ""}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            type="search"
            placeholder="Search by employee ID, event type, content ID..."
            className="border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <EnterpriseButton type="button" variant="secondary" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </EnterpriseButton>
          <EnterpriseButton type="button" variant="primary" onClick={onExport} disabled={exporting}>
            <Filter className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </EnterpriseButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Event Type</span>
          <EnterpriseSelect
            value={filters.eventType ?? ""}
            onChange={(event) => onChange({ ...filters, eventType: event.target.value })}
          >
            <option value="">All Types</option>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </EnterpriseSelect>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Outcome</span>
          <EnterpriseSelect
            value={filters.outcome ?? ""}
            onChange={(event) => onChange({ ...filters, outcome: event.target.value })}
          >
            <option value="">All Outcomes</option>
            {OUTCOME_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </EnterpriseSelect>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Channel</span>
          <EnterpriseSelect
            value={filters.channel ?? ""}
            onChange={(event) => onChange({ ...filters, channel: event.target.value })}
          >
            <option value="">All Channels</option>
            {CHANNEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </EnterpriseSelect>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Content ID</span>
          <EnterpriseInput
            value={filters.contentId ?? ""}
            onChange={(event) => onChange({ ...filters, contentId: event.target.value })}
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2816"
          />
        </label>
      </div>
    </div>
  );
}