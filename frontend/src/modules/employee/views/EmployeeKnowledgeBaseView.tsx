"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Clock3, MessageSquareText, ShieldAlert, Sparkles } from "lucide-react";
import {
  fetchChatbotHistory,
  fetchMyEscalations,
  submitChatbotQuery,
  type ChatbotResponse,
  type QueryEscalationEntry,
  type QueryLogEntry,
} from "@/lib/api-client";

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(status?: string | null) {
  return status === "resolved" ? "Resolved" : "Pending";
}

export default function EmployeeKnowledgeBaseView() {
  const [history, setHistory] = useState<QueryLogEntry[]>([]);
  const [myQueries, setMyQueries] = useState<QueryEscalationEntry[]>([]);
  const [queryText, setQueryText] = useState("");
  const [response, setResponse] = useState<ChatbotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const [queryHistory, escalations] = await Promise.all([fetchChatbotHistory(), fetchMyEscalations()]);
    setHistory(queryHistory);
    setMyQueries(escalations);
  };

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const [queryHistory, escalations] = await Promise.all([fetchChatbotHistory(), fetchMyEscalations()]);

      if (mounted) {
        setHistory(queryHistory);
        setMyQueries(escalations);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await submitChatbotQuery(queryText);
      setResponse(result);
      await reload();
      setQueryText("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">HR Help</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Enterprise HR Knowledge Assistant</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Ask HR questions here. If the assistant is not confident, your question is routed to HR and tracked below.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-medium text-slate-900">Ask a question</label>
          <textarea
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            rows={4}
            placeholder="How many leave days can I carry forward?"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Knowledge retrieval happens through the assistant only.</p>
            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessageSquareText className="h-4 w-4" />
              {loading ? "Sending..." : "Ask AI"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        {response ? (
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {response.escalate ? <ShieldAlert className="h-4.5 w-4.5 text-amber-600" /> : <Sparkles className="h-4.5 w-4.5 text-emerald-600" />}
              {response.escalate ? "Escalation created" : "AI answer"}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {response.answer ?? response.message ?? "Your query has been escalated to HR. You will receive a response shortly."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Confidence: {(response.confidence * 100).toFixed(0)}%</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Escalation: {response.escalate ? "yes" : "no"}</span>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-slate-900">My Queries</h3>
          </div>
          <div className="mt-4 space-y-3">
            {myQueries.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No escalated queries yet.
              </p>
            ) : null}
            {myQueries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{entry.query?.queryText}</p>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {statusLabel(entry.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Submitted: {formatDate(entry.query?.createdAt)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {entry.resolutionText ?? "HR is reviewing this question."}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-slate-900">Chat history</h3>
          </div>
          <div className="mt-4 space-y-3">
            {history.map((entry) => (
              <div key={entry.queryId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">{entry.queryText}</p>
                <p className="mt-1 text-xs text-slate-500">Confidence: {(Number(entry.confidenceScore ?? 0) * 100).toFixed(0)}%</p>
                <p className="mt-2 text-sm text-slate-600">
                  {entry.escalationFlag ? "Escalated for HR review." : entry.responseDelivered}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
