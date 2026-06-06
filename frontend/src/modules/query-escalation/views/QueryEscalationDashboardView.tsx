"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Checkbox } from "@mantine/core";
import { CheckCircle2, Clock3, MessageSquareReply, Search } from "lucide-react";
import { fetchAllEscalations, respondToEscalation, type QueryEscalationEntry } from "@/lib/api-client";
import { DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseCard, EnterpriseTextarea, MetricCard, PaginationBar, SectionHeader } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

type TabKey = "pending" | "resolved";

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(status?: string | null) {
  return status === "resolved" ? "Resolved" : "Pending";
}

export default function QueryEscalationDashboardView() {
  const [escalations, setEscalations] = useState<QueryEscalationEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const response = await fetchAllEscalations();
    setEscalations(response);
  };

  useEffect(() => {
    void (async () => {
      try {
        await reload();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load escalations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return escalations.filter((item) => (activeTab === "resolved" ? item.status === "resolved" : item.status !== "resolved"));
  }, [activeTab, escalations]);
  const pagination = useClientPagination(filtered);
  const selection = useRowSelection(pagination.paginatedItems.map((item) => item.id), filtered.map((item) => item.id));

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const pendingCount = escalations.filter((item) => item.status !== "resolved").length;
  const resolvedCount = escalations.filter((item) => item.status === "resolved").length;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !resolutionText.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await respondToEscalation(selected.id, resolutionText.trim());
      setResolutionText("");
      await reload();
      setActiveTab("resolved");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Employee Query Escalations"
        title="HR response queue"
        description="Review low-confidence chatbot questions, respond to employees, and publish the answer back into retrieval."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending" value={String(pendingCount)} helper="Needs HR response" icon={<Clock3 className="h-5 w-5" />} />
        <MetricCard label="Resolved" value={String(resolvedCount)} helper="Published answers" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Queue Size" value={String(escalations.length)} helper="All visible escalations" icon={<Search className="h-5 w-5" />} />
        <MetricCard label="Active View" value={activeTab === "resolved" ? "Resolved" : "Pending"} helper="Current filter" icon={<MessageSquareReply className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <EnterpriseCard className="p-6">
        <div className="mt-5 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          {[
            { key: "pending" as const, label: "Pending", count: pendingCount, icon: Clock3 },
            { key: "resolved" as const, label: "Resolved", count: resolvedCount, icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}

                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                  active ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <EnterpriseBadge tone={active ? "info" : "neutral"}>{tab.count}</EnterpriseBadge>
              </button>
            );
          })}
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
          <span>{selection.selectedCount} items selected</span>
          {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
        </div>

        <DataViewport height={620} className="mt-4">
        <div className="space-y-3 pr-3">
          {loading ? <p className="text-sm text-slate-500">Loading escalations...</p> : null}
          {!loading && filtered.length === 0 ? (
            <EmptyState title={`No ${activeTab} escalations found.`} description="Escalated employee questions matching this view will appear here." />
          ) : null}
          {pagination.paginatedItems.map((item) => {
            const active = item.id === selected?.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={[
                  "w-full rounded-xl border px-4 py-4 text-left transition",
                  active ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <Checkbox checked={selection.selectedSet.has(item.id)} onChange={() => selection.toggleOne(item.id)} onClick={(event) => event.stopPropagation()} aria-label={`Select escalation ${item.id}`} />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.query?.queryText ?? "Untitled query"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.query?.employee?.name ?? "Employee"} - {formatDate(item.query?.createdAt)}
                    </p>
                  </div>
                  <EnterpriseBadge tone={item.status === "resolved" ? "resolved" : "pending"} className="shrink-0">
                    {statusLabel(item.status)}
                  </EnterpriseBadge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Confidence: {(Number(item.query?.confidenceScore ?? 0) * 100).toFixed(0)}%
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Escalation #{item.id}</span>
                </div>
              </button>
            );
          })}
        </div>
        </DataViewport>
        <div className="mt-4">
          <PaginationBar {...pagination} onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} disabled={loading} />
        </div>
      </EnterpriseCard>

      <EnterpriseCard className="p-6 xl:sticky xl:top-6 xl:self-start">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-900">Query details</h3>
        </div>

        {selected ? (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee query</p>
              <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800">
                {selected.query?.queryText}
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="mt-1 font-semibold text-slate-900">{(Number(selected.query?.confidenceScore ?? 0) * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Escalated</p>
                <p className="mt-1 font-semibold text-slate-900">{formatDate(selected.query?.createdAt)}</p>
              </div>
            </div>

            {selected.status === "resolved" ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">HR response</p>
                <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                  {selected.resolutionText}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900">Respond to employee</label>
                <EnterpriseTextarea
                  value={resolutionText}
                  onChange={(event) => setResolutionText(event.target.value)}
                  rows={6}
                  placeholder="Write the HR-approved answer..."
                />
                <EnterpriseButton
                  type="submit"
                  disabled={submitting || !resolutionText.trim()}
                  variant="primary"
                  className="w-full"
                >
                  <MessageSquareReply className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit response"}
                </EnterpriseButton>
              </form>
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">Select an escalation to view details.</p>
        )}
      </EnterpriseCard>
      </div>
    </div>
  );
}
