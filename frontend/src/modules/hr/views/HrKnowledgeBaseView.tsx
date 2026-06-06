"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Checkbox } from "@mantine/core";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import {
  createKnowledgeBaseArticle,
  fetchKnowledgeBaseApprovals,
  fetchKnowledgeBaseArticles,
  type KnowledgeBaseArticle,
} from "@/lib/api-client";
import { DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseCard, EnterpriseInput, EnterpriseTextarea, PaginationBar, SectionHeader } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

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
  const approvalPagination = useClientPagination(pendingApprovals);
  const articlePagination = useClientPagination(articles);
  const approvalSelection = useRowSelection(approvalPagination.paginatedItems.map((article) => article.articleId), pendingApprovals.map((article) => article.articleId));
  const articleSelection = useRowSelection(articlePagination.paginatedItems.map((article) => article.articleId), articles.map((article) => article.articleId));

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
    void loadContent(); // eslint-disable-line react-hooks/set-state-in-effect
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
    <div className="space-y-6">
      <SectionHeader
        eyebrow="HR Content Studio"
        title="Policy creation and approval queue"
        description="Draft policy articles here, save them for later, or submit them for approval before the AI indexing workflow picks them up."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <EnterpriseCard className="p-4">
          <h3 className="text-sm font-semibold text-slate-900">Draft form</h3>
          <p className="mt-1 text-sm text-slate-600">Use the same endpoint for draft saves and approval submission.</p>

          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <EnterpriseInput value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Policy title" />
            <EnterpriseInput value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
            <EnterpriseInput value={roleTag} onChange={(event) => setRoleTag(event.target.value)} className="sm:col-span-2" placeholder="Role tag" />
            <EnterpriseTextarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-40 sm:col-span-2" placeholder="Policy content" />

            {message ? <p className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
            {errorMessage ? <p className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}

            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
              <EnterpriseButton type="button" disabled={isSaving || !title.trim() || !content.trim()} onClick={() => void persistArticle("draft")} variant="secondary">
                {isSaving ? "Saving..." : "Save Draft"}
              </EnterpriseButton>
              <EnterpriseButton type="submit" disabled={isSaving || !title.trim() || !content.trim()} variant="primary">
                {isSaving ? "Submitting..." : "Submit For Approval"}
              </EnterpriseButton>
            </div>
          </form>
        </EnterpriseCard>

        <EnterpriseCard className="p-4">
          <h3 className="text-sm font-semibold text-slate-900">Approval queue</h3>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Checkbox checked={approvalSelection.allVisibleSelected} indeterminate={approvalSelection.someVisibleSelected} onChange={approvalSelection.toggleVisible} label="Select all" />
            <span>{approvalSelection.selectedCount} items selected</span>
            {approvalSelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={approvalSelection.clearSelection}>Deselect all</button> : null}
          </div>
          <DataViewport height={520} className="mt-4">
          <div className="space-y-3 pr-3">
            {isLoading ? <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">Loading knowledge base approvals...</p> : null}
            {approvalPagination.paginatedItems.map((article) => (
              <div key={article.articleId} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{article.category ?? "Uncategorized"} • {article.writer?.name ?? "Unknown author"}</p>
                  </div>
                  <EnterpriseBadge tone="pending">{article.status ?? "pending"}</EnterpriseBadge>
                </div>
              </div>
            ))}
            {!isLoading && !pendingApprovals.length ? <EmptyState title="No policies found." description="Policy drafts awaiting approval will appear here." /> : null}
          </div>
          </DataViewport>
          <div className="mt-4">
            <PaginationBar {...approvalPagination} onChange={approvalPagination.setPage} onPageSizeChange={approvalPagination.setPageSize} disabled={isLoading} />
          </div>
        </EnterpriseCard>
      </div>

      <EnterpriseCard className="p-4">
        <h3 className="text-sm font-semibold text-slate-900">Article inventory</h3>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <Checkbox checked={articleSelection.allVisibleSelected} indeterminate={articleSelection.someVisibleSelected} onChange={articleSelection.toggleVisible} label="Select all" />
          <span>{articleSelection.selectedCount} items selected</span>
          {articleSelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={articleSelection.clearSelection}>Deselect all</button> : null}
        </div>
        <DataViewport height={620} className="mt-4">
        <div className="grid gap-3 pr-3 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? <p className="md:col-span-2 xl:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">Loading knowledge base articles...</p> : null}
          {articlePagination.paginatedItems.map((article) => (
            <div key={article.articleId} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <Checkbox checked={articleSelection.selectedSet.has(article.articleId)} onChange={() => articleSelection.toggleOne(article.articleId)} aria-label={`Select ${article.title ?? "article"}`} className="mb-3" />
              <p className="text-sm font-semibold text-slate-900">{article.title}</p>
              <p className="mt-1 text-xs text-slate-500">{article.category ?? "Uncategorized"} • {article.writer?.name ?? "Unknown author"}</p>
              <p className="mt-3 text-sm text-slate-600">
                {article.content?.slice(0, 120)}
                {article.content && article.content.length > 120 ? "..." : ""}
              </p>
            </div>
          ))}
          {!isLoading && !articles.length ? <div className="md:col-span-2 xl:col-span-3"><EmptyState title="No policies found." description="Published knowledge base articles will appear here." /></div> : null}
        </div>
        </DataViewport>
        <div className="mt-4">
          <PaginationBar {...articlePagination} onChange={articlePagination.setPage} onPageSizeChange={articlePagination.setPageSize} disabled={isLoading} />
        </div>
      </EnterpriseCard>
    </div>
  );
}
