"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Clock3, MessageSquareText, ShieldAlert, Sparkles } from "lucide-react";
import { Checkbox } from "@mantine/core";
import {
  fetchChatbotHistory,
  fetchMyEscalations,
  submitChatbotQuery,
  type ChatbotResponse,
  type QueryEscalationEntry,
  type QueryLogEntry,
} from "@/lib/api-client";
import { DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseCard, EnterpriseTextarea, PaginationBar, SectionHeader } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

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
  const queryPagination = useClientPagination(myQueries);
  const historyPagination = useClientPagination(history);
  const querySelection = useRowSelection(
    queryPagination.paginatedItems.map((entry) => entry.id),
    myQueries.map((entry) => entry.id),
  );
  const historySelection = useRowSelection(
    historyPagination.paginatedItems.map((entry) => entry.queryId),
    history.map((entry) => entry.queryId),
  );

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
      <SectionHeader
        eyebrow="HR Help"
        title="Enterprise HR Knowledge Assistant"
        description="Ask HR questions here. If the assistant is not confident, your question is routed to HR and tracked below."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <EnterpriseCard className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Ask a question</label>
            <EnterpriseTextarea value={queryText} onChange={(event) => setQueryText(event.target.value)} rows={4} placeholder="How many leave days can I carry forward?" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Knowledge retrieval happens through the assistant only.</p>
              <EnterpriseButton type="submit" disabled={loading || !queryText.trim()} variant="primary">
                <MessageSquareText className="h-4 w-4" />
                {loading ? "Sending..." : "Ask AI"}
              </EnterpriseButton>
            </div>
          </form>

          {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          {response ? (
            <EnterpriseCard className="mt-4 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                {response.escalate ? <ShieldAlert className="h-4.5 w-4.5 text-amber-600" /> : <Sparkles className="h-4.5 w-4.5 text-emerald-600" />}
                {response.escalate ? "Escalation created" : "AI answer"}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {response.answer ?? response.message ?? "Your query has been escalated to HR. You will receive a response shortly."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <EnterpriseBadge tone="info">Confidence: {(response.confidence * 100).toFixed(0)}%</EnterpriseBadge>
                <EnterpriseBadge tone={response.escalate ? "warning" : "success"}>Escalation: {response.escalate ? "yes" : "no"}</EnterpriseBadge>
              </div>
            </EnterpriseCard>
          ) : null}
        </EnterpriseCard>

        <div className="space-y-6">
          <EnterpriseCard className="p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-blue-700" />
              <h3 className="text-lg font-semibold text-slate-900">My Queries</h3>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Checkbox checked={querySelection.allVisibleSelected} indeterminate={querySelection.someVisibleSelected} onChange={querySelection.toggleVisible} label="Select all" />
              <span>{querySelection.selectedCount} items selected</span>
              {querySelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={querySelection.clearSelection}>Deselect all</button> : null}
            </div>
            <DataViewport height={520} className="mt-4">
            <div className="space-y-3 pr-3">
              {myQueries.length === 0 ? (
                <EmptyState title="No escalated queries found." description="Questions routed to HR will appear here." />
              ) : null}
              {queryPagination.paginatedItems.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={querySelection.selectedSet.has(entry.id)} onChange={() => querySelection.toggleOne(entry.id)} aria-label={`Select query ${entry.id}`} />
                    <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{entry.query?.queryText}</p>
                    <EnterpriseBadge tone={entry.status === "resolved" ? "resolved" : "pending"} className="shrink-0">
                      {statusLabel(entry.status)}
                    </EnterpriseBadge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Submitted: {formatDate(entry.query?.createdAt)}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{entry.resolutionText ?? "HR is reviewing this question."}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </DataViewport>
            <div className="mt-4">
              <PaginationBar {...queryPagination} onChange={queryPagination.setPage} onPageSizeChange={queryPagination.setPageSize} />
            </div>
          </EnterpriseCard>

          <EnterpriseCard className="p-6">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-blue-700" />
              <h3 className="text-lg font-semibold text-slate-900">Chat history</h3>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Checkbox checked={historySelection.allVisibleSelected} indeterminate={historySelection.someVisibleSelected} onChange={historySelection.toggleVisible} label="Select all" />
              <span>{historySelection.selectedCount} items selected</span>
              {historySelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={historySelection.clearSelection}>Deselect all</button> : null}
            </div>
            <DataViewport height={520} className="mt-4">
            <div className="space-y-3 pr-3">
              {historyPagination.paginatedItems.map((entry) => (
                <div key={entry.queryId} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                  <Checkbox checked={historySelection.selectedSet.has(entry.queryId)} onChange={() => historySelection.toggleOne(entry.queryId)} aria-label={`Select chat ${entry.queryId}`} />
                  <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{entry.queryText}</p>
                  <p className="mt-1 text-xs text-slate-500">Confidence: {(Number(entry.confidenceScore ?? 0) * 100).toFixed(0)}%</p>
                  <p className="mt-2 text-sm text-slate-600">{entry.escalationFlag ? "Escalated for HR review." : entry.responseDelivered}</p>
                  </div>
                  </div>
                </div>
              ))}
              {!history.length ? <EmptyState title="No chat history found." description="Older conversations will appear here as you ask questions." /> : null}
            </div>
            </DataViewport>
            <div className="mt-4">
              <PaginationBar {...historyPagination} onChange={historyPagination.setPage} onPageSizeChange={historyPagination.setPageSize} />
            </div>
          </EnterpriseCard>
        </div>
      </div>
    </div>
  );
}
