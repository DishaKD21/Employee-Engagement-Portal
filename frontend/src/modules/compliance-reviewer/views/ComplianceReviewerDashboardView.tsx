"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download, LockKeyhole, SearchCheck, ShieldCheck, Sparkles, Users2, Clock3 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import AuditFilters from "../components/AuditFilters";
import AuditLogTable from "../components/AuditLogTable";
import { exportAuditLogs, getAuditLogs, type AuditLogFilters, type AuditLogListResponse } from "../services/audit.service";

const PAGE_SIZE = 8;

type Metrics = {
  total: number;
  currentPage: number;
  loaded: number;
  withDecisions: number;
};

function formatShortDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function downloadCsv(rows: AuditLogListResponse["items"]) {
  const headers = ["log_id", "event_type", "employee_id", "content_id", "channel", "outcome", "reviewer_decision", "created_at"];
  const escapeValue = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [headers.join(",")]
    .concat(
      rows.map((row) =>
        [row.logId, row.eventType, row.employeeId, row.contentId, row.channel, row.outcome, row.reviewerDecision, row.createdAt]
          .map(escapeValue)
          .join(","),
      ),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `audit-logs-${new Date().toISOString().replace(/[T:.]/g, "-")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function metricCard({ label, value, helper, icon: Icon }: { label: string; value: string; helper: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[1.5rem] border border-white/30 bg-white/15 p-4 text-white shadow-lg shadow-cyan-900/10 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-white/80">{helper}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function ComplianceReviewerDashboardView() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const [auditData, setAuditData] = useState<AuditLogListResponse>({ total: 0, items: [] });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilters>({ limit: PAGE_SIZE });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentSkip = (page - 1) * PAGE_SIZE;

  useEffect(() => {
    if (!token) {
      return;
    }

    const authToken = token as string;

    let active = true;

    async function loadLogs() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getAuditLogs(authToken, {
          ...filters,
          skip: currentSkip,
          limit: PAGE_SIZE,
        });

        if (active) {
          setAuditData(response);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getErrorMessage(error, "Failed to load audit logs"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      active = false;
    };
  }, [token, filters, currentSkip]);

  const metrics = useMemo<Metrics>(() => {
    const withDecisions = auditData.items.filter((item) => Boolean(item.reviewerDecision)).length;

    return {
      total: auditData.total,
      currentPage: page,
      loaded: auditData.items.length,
      withDecisions,
    };
  }, [auditData.items, auditData.total, page]);

  const lastUpdated = auditData.items[0]?.createdAt ?? null;
  const totalPages = Math.max(1, Math.ceil((auditData.total || 0) / PAGE_SIZE));

  const handleReset = () => {
    setPage(1);
    setFilters({ limit: PAGE_SIZE });
  };

  const handleExport = async () => {
    if (!token) return;

    setExporting(true);
    setErrorMessage("");

    try {
      const response = await exportAuditLogs(token, filters);
      downloadCsv(response.items);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to export audit logs"));
    } finally {
      setExporting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-slate-900">
        <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Compliance Reviewer Dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Please sign in with a compliance reviewer or super admin account to view the immutable audit log.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white/80 px-5 py-6 backdrop-blur xl:flex xl:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-200/60">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight">Wolf Pack</p>
              <p className="text-xs text-slate-500">aegis.ai</p>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Audit</p>
            <div className="mt-3 rounded-[1.25rem] border border-violet-200 bg-violet-50 px-4 py-4 shadow-sm">
              <p className="text-sm font-semibold text-violet-700">Audit Log Viewer</p>
              <p className="mt-1 text-xs leading-5 text-violet-600/80">Immutable compliance trail for platform events.</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white">
                {((user?.name ?? role ?? "CR").slice(0, 2) || "CR").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "Compliance Reviewer"}</p>
                <p className="truncate text-xs text-slate-500">{role ?? "COMPLIANCE_REVIEWER"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Role Access</p>
              <p className="mt-1 text-sm text-slate-600">Read, search, and export only.</p>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-white/40 bg-white/75 p-5 shadow-lg shadow-slate-200/60 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-600">Compliance Reviewer</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Audit Log Viewer</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Append-only audit trail for platform activity. Search by employee ID, event type, or content ID, then export the filtered results as CSV.</p>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-r from-violet-600 via-sky-500 to-cyan-500 p-[1px] shadow-xl shadow-cyan-200/40">
              <div className="flex flex-wrap items-center gap-3 rounded-[1.45rem] bg-white/10 px-4 py-3 text-white backdrop-blur-md">
                <Sparkles className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">Live & Immutable</p>
                  <p className="text-xs text-white/80">BR-006 • AC-07</p>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-4 xl:grid-cols-4">
            {metricCard({ label: "Total Events", value: String(metrics.total).padStart(2, "0"), helper: "Matched by the active filters", icon: ShieldCheck })}
            {metricCard({ label: "Visible Rows", value: String(metrics.loaded).padStart(2, "0"), helper: `Page ${metrics.currentPage} of ${totalPages}`, icon: Users2 })}
            {metricCard({ label: "Reviewed Rows", value: String(metrics.withDecisions).padStart(2, "0"), helper: "Rows with reviewer decisions", icon: SearchCheck })}
            {metricCard({ label: "Last Update", value: lastUpdated ? formatShortDate(lastUpdated) : "--", helper: "Newest record in the current page", icon: Clock3 })}
          </section>

          <section className="space-y-5">
            {errorMessage ? (
              <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
            ) : null}

            <AuditFilters
              filters={filters}
              onChange={(next) => {
                setPage(1);
                setFilters((current) => ({ ...current, ...next }));
              }}
              onReset={handleReset}
              onExport={() => void handleExport()}
              exporting={exporting}
            />

            <AuditLogTable logs={auditData.items} loading={loading} />

            <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-600">
                Showing {auditData.items.length} of {auditData.total} events • Append-only • Immutable • BR-006
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || loading}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}