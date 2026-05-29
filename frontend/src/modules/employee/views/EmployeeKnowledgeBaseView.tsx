"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, BookOpenText, MessageSquareText, ShieldAlert, Sparkles } from "lucide-react";
import {
  fetchChatbotHistory,
  fetchKnowledgeBaseArticles,
  submitChatbotQuery,
  type ChatbotResponse,
  type KnowledgeBaseArticle,
  type QueryLogEntry,
} from "@/lib/api-client";

export default function EmployeeKnowledgeBaseView() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [history, setHistory] = useState<QueryLogEntry[]>([]);
  const [queryText, setQueryText] = useState("");
  const [response, setResponse] = useState<ChatbotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [articleList, queryHistory] = await Promise.all([fetchKnowledgeBaseArticles(), fetchChatbotHistory()]);
      setArticles(articleList);
      setHistory(queryHistory);
    })();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await submitChatbotQuery(queryText);
      setResponse(result);
      setHistory(await fetchChatbotHistory());
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
          Ask policy questions here. Low-confidence responses are escalated for HR follow-up, while approved articles stay indexed in the isolated AI service.
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
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Answers come from the separate FastAPI service through the Node workflow layer.</p>
            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              {response.answer ?? "The request has been routed to HR because the AI confidence fell below the escalation threshold."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">Confidence: {(response.confidence * 100).toFixed(0)}%</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Matched article: {response.matchedArticleId ?? "none"}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Escalation: {response.escalate ? "yes" : "no"}</span>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpenText className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-slate-900">Published articles</h3>
          </div>
          <div className="mt-4 space-y-3">
            {articles.map((article) => (
              <article key={article.articleId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-slate-900">{article.title}</h4>
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">{article.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {article.content?.slice(0, 180)}{article.content && article.content.length > 180 ? "..." : ""}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-semibold text-slate-900">Query history</h3>
          </div>
          <div className="mt-4 space-y-3">
            {history.map((entry) => (
              <div key={entry.queryId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">{entry.queryText}</p>
                <p className="mt-1 text-xs text-slate-500">Confidence: {(Number(entry.confidenceScore ?? 0) * 100).toFixed(0)}%</p>
                <p className="mt-2 text-sm text-slate-600">{entry.responseDelivered ?? "Escalated for manual resolution."}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}