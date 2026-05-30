"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Clock3, MessageSquareReply, Search } from "lucide-react";
import { fetchAllEscalations, respondToEscalation, type QueryEscalationEntry } from "@/lib/api-client";

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">Employee Query Escalations</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">HR response queue</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Review low-confidence chatbot questions, respond to employees, and publish the answer back into retrieval.
        </p>

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
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                  active ? "bg-white text-violet-700 shadow-sm" : "text-slate-600 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-5 space-y-3">
          {loading ? <p className="text-sm text-slate-500">Loading escalations...</p> : null}
          {!loading && filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No {activeTab} escalations.
            </div>
          ) : null}
          {filtered.map((item) => {
            const active = item.id === selected?.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={[
                  "w-full rounded-2xl border px-4 py-4 text-left transition",
                  active ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.query?.queryText ?? "Untitled query"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.query?.employee?.name ?? "Employee"} - {formatDate(item.query?.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {statusLabel(item.status)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1">
                    Confidence: {(Number(item.query?.confidenceScore ?? 0) * 100).toFixed(0)}%
                  </span>
                  <span className="rounded-full bg-white px-3 py-1">Escalation #{item.id}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6 xl:self-start">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-slate-900">Query details</h3>
        </div>

        {selected ? (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee query</p>
              <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800">
                {selected.query?.queryText}
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="mt-1 font-semibold text-slate-900">{(Number(selected.query?.confidenceScore ?? 0) * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Escalated</p>
                <p className="mt-1 font-semibold text-slate-900">{formatDate(selected.query?.createdAt)}</p>
              </div>
            </div>

            {selected.status === "resolved" ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">HR response</p>
                <p className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                  {selected.resolutionText}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900">Respond to employee</label>
                <textarea
                  value={resolutionText}
                  onChange={(event) => setResolutionText(event.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400"
                  placeholder="Write the HR-approved answer..."
                />
                <button
                  type="submit"
                  disabled={submitting || !resolutionText.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MessageSquareReply className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit response"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">Select an escalation to view details.</p>
        )}
      </aside>
    </div>
  );
}
