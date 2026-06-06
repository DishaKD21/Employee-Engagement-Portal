"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@mantine/core";
import { approveKnowledgeBaseArticle, fetchKnowledgeBaseApprovals, rejectKnowledgeBaseArticle, type KnowledgeBaseArticle } from "@/lib/api-client";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import { DataTableShell, DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseCard, PaginationBar, SectionHeader } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function statusTone(status?: string | null) {
  const normalized = status?.toLowerCase();

  if (normalized === "published" || normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

export default function HrManagerKnowledgeBaseApprovalsView() {
  const [approvals, setApprovals] = useState<KnowledgeBaseArticle[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<KnowledgeBaseArticle | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const pagination = useClientPagination(approvals);
  const selection = useRowSelection(pagination.paginatedItems.map((approval) => approval.articleId), approvals.map((approval) => approval.articleId));

  async function loadApprovals() {
    setLoading(true);

    try {
      setApprovals(await fetchKnowledgeBaseApprovals());
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load knowledge base approvals"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApprovals(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleApprove = async (approval: KnowledgeBaseArticle) => {
    try {
      await approveKnowledgeBaseArticle(approval.articleId);
      setMessage("Knowledge base article approved and published.");
      setSelectedApproval(null);
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to approve knowledge base article"));
    }
  };

  const handleReject = async (approval: KnowledgeBaseArticle) => {
    const comments = window.prompt("Enter rejection comments (optional)") ?? undefined;

    try {
      await rejectKnowledgeBaseArticle(approval.articleId, comments);
      setMessage("Knowledge base article rejected.");
      setSelectedApproval(null);
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to reject knowledge base article"));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Knowledge Base"
        title="Knowledge Base Approvals"
        description="Review pending policy articles from HR and publish approved content to the AI indexer."
      />

      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      {selectedApproval ? (
        <EnterpriseCard className="p-6 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedApproval.title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedApproval.category ?? "Uncategorized"} • {selectedApproval.writer?.name ?? "Unknown author"}
              </p>
            </div>
            <EnterpriseBadge tone={statusTone(selectedApproval.status)}>{selectedApproval.status ?? "pending"}</EnterpriseBadge>
          </div>
          <p className="text-sm leading-6 text-slate-700">{selectedApproval.content}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <EnterpriseButton type="button" variant="primary" onClick={() => void handleApprove(selectedApproval)}>
              Approve
            </EnterpriseButton>
            <EnterpriseButton type="button" variant="danger" onClick={() => void handleReject(selectedApproval)}>
              Reject
            </EnterpriseButton>
          </div>
        </EnterpriseCard>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
          <span>{selection.selectedCount} items selected</span>
          {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
        </div>
        <DataTableShell>
          <DataViewport>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-[1] bg-slate-50 text-slate-600">
              <tr>
                <th className="w-12 px-5 py-3 font-semibold"></th>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Author</th>
                <th className="px-5 py-3 font-semibold">Created Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pagination.paginatedItems.map((approval) => (
                <tr key={approval.articleId} className="text-slate-800 hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <Checkbox checked={selection.selectedSet.has(approval.articleId)} onChange={() => selection.toggleOne(approval.articleId)} aria-label={`Select ${approval.title ?? "article"}`} />
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{approval.title}</td>
                  <td className="px-5 py-4">{approval.category ?? "-"}</td>
                  <td className="px-5 py-4">{approval.writer?.name ?? "-"}</td>
                  <td className="px-5 py-4">{formatDate(approval.createdAt)}</td>
                  <td className="px-5 py-4">
                    <EnterpriseBadge tone={statusTone(approval.status)}>{approval.status ?? "pending"}</EnterpriseBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <EnterpriseButton type="button" variant="secondary" onClick={() => setSelectedApproval(approval)}>
                        View
                      </EnterpriseButton>
                      <EnterpriseButton type="button" variant="primary" onClick={() => void handleApprove(approval)}>
                        Approve
                      </EnterpriseButton>
                      <EnterpriseButton type="button" variant="danger" onClick={() => void handleReject(approval)}>
                        Reject
                      </EnterpriseButton>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !approvals.length ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8">
                    <EmptyState title="No pending knowledge base approvals." description="Knowledge base reviews awaiting approval will appear here." />
                  </td>
                </tr>
              ) : null}
            </tbody>
            </table>
          </div>
          </DataViewport>
        </DataTableShell>
        <PaginationBar {...pagination} onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} disabled={loading} />
      </div>
    </div>
  );
}
