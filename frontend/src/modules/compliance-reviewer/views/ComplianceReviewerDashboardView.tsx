"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download, LockKeyhole, SearchCheck, ShieldCheck, Sparkles, Users2, Clock3 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import AuditFilters from "../components/AuditFilters";
import AuditLogTable from "../components/AuditLogTable";
import { exportAuditLogs, getAuditLogs, type AuditLogFilters, type AuditLogListResponse } from "../services/audit.service";
import { EnterpriseButton, MetricCard, PaginationBar, SectionHeader } from "@/components/ui/enterprise";

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

export default function ComplianceReviewerDashboardView() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const [auditData, setAuditData] = useState<AuditLogListResponse>({ total: 0, items: [] });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<AuditLogFilters>({ limit: 10 });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentSkip = (page - 1) * pageSize;

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
          limit: pageSize,
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
  }, [token, filters, currentSkip, pageSize]);

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
  const totalPages = Math.max(1, Math.ceil((auditData.total || 0) / pageSize));

  const handleReset = () => {
    setPage(1);
    setFilters({ limit: pageSize });
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 m-10 text-slate-900">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-700 text-white">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Compliance Reviewer Dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Please sign in with a compliance reviewer or super admin account to view the immutable audit log.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-10 text-slate-900 sm:px-8 lg:px-10">
      <SectionHeader
        eyebrow="Compliance Reviewer"
        title="Audit log viewer"
        description="Append-only audit trail for platform activity. Search by employee ID, event type, or content ID, then export the filtered results as CSV."
        actions={
          <EnterpriseButton type="button" variant="secondary" onClick={() => void handleExport()} disabled={exporting}>
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </EnterpriseButton>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard label="Total Events" value={String(metrics.total).padStart(2, "0")} helper="Matched by the active filters" icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Visible Rows" value={String(metrics.loaded).padStart(2, "0")} helper={`Page ${metrics.currentPage} of ${totalPages}`} icon={<Users2 className="h-5 w-5" />} />
        <MetricCard label="Reviewed Rows" value={String(metrics.withDecisions).padStart(2, "0")} helper="Rows with reviewer decisions" icon={<SearchCheck className="h-5 w-5" />} />
        <MetricCard label="Last Update" value={lastUpdated ? formatShortDate(lastUpdated) : "--"} helper="Newest record in the current page" icon={<Clock3 className="h-5 w-5" />} />
      </div>

      {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

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

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={auditData.total}
        pageSize={pageSize}
        onChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPage(1);
          setPageSize(nextPageSize);
          setFilters((current) => ({ ...current, limit: nextPageSize }));
        }}
        disabled={loading}
      />
    </div>
  );
}
