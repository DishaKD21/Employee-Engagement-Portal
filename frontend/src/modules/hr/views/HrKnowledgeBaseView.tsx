"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import {
  createKnowledgeBaseArticle,
  fetchKnowledgeBaseApprovals,
  fetchKnowledgeBaseArticles,
  type KnowledgeBaseArticle,
} from "@/lib/api-client";

export default function HrKnowledgeBaseView() {
  const authUser = useAuthStore((state) => state.user);
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<KnowledgeBaseArticle[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [roleTag, setRoleTag] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadContent() {
    setIsLoading(true);

    try {
      const [publishedArticles, approvalQueue] = await Promise.all([fetchKnowledgeBaseArticles(), fetchKnowledgeBaseApprovals()]);
      setArticles(publishedArticles);
      setPendingApprovals(approvalQueue);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load knowledge base content"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContent();
  }, []);

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setRoleTag("");
    setContent("");
  };

  const persistArticle = async (status: "draft" | "pending_approval") => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage("Title and content are required");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setMessage("");

    try {
      await createKnowledgeBaseArticle({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        role_tag: roleTag.trim() || undefined,
        author: Number.isFinite(Number(authUser?.employeeId)) ? Number(authUser?.employeeId) : undefined,
        status,
      });

      setMessage(status === "draft" ? "Draft saved." : "Article submitted for approval.");
      resetForm();
      await loadContent();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to save policy article"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await persistArticle("pending_approval");
  };

  return (
    <section className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-600">HR Content Studio</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Policy creation and approval queue</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Draft policy articles here, save them for later, or submit them for approval before the AI indexing workflow picks them up.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Draft form</h3>
          <p className="mt-1 text-sm text-slate-600">Use the same endpoint for draft saves and approval submission.</p>

          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              placeholder="Policy title"
            />
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              placeholder="Category"
            />
            <input
              value={roleTag}
              onChange={(event) => setRoleTag(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:col-span-2"
              placeholder="Role tag"
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-40 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:col-span-2"
              placeholder="Policy content"
            />

            {message ? <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
            {errorMessage ? <p className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}

            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                disabled={isSaving || !title.trim() || !content.trim()}
                onClick={() => void persistArticle("draft")}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim() || !content.trim()}
                className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Submitting..." : "Submit For Approval"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Approval queue</h3>
          <div className="mt-4 space-y-3">
            {isLoading ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">Loading knowledge base approvals...</p> : null}
            {pendingApprovals.map((article) => (
              <div key={article.articleId} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {article.category ?? "Uncategorized"} • {article.writer?.name ?? "Unknown author"}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {article.status ?? "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Article inventory</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? <p className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">Loading knowledge base articles...</p> : null}
          {articles.map((article) => (
            <div key={article.articleId} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">{article.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {article.category ?? "Uncategorized"} • {article.writer?.name ?? "Unknown author"}
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {article.content?.slice(0, 120)}
                {article.content && article.content.length > 120 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}