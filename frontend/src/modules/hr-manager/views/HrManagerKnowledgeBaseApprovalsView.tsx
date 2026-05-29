"use client";

import { useEffect, useState } from "react";
import { approveKnowledgeBaseArticle, fetchKnowledgeBaseApprovals, rejectKnowledgeBaseArticle, type KnowledgeBaseArticle } from "@/lib/api-client";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function statusTone(status?: string | null) {
  const normalized = status?.toLowerCase();

  if (normalized === "published" || normalized === "approved") return "bg-emerald-100 text-emerald-700";
  if (normalized === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export default function HrManagerKnowledgeBaseApprovalsView() {
  const [approvals, setApprovals] = useState<KnowledgeBaseArticle[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<KnowledgeBaseArticle | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    void loadApprovals();
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
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Knowledge Base Approvals</h1>
          <p className="mt-2 text-slate-600">Review pending policy articles from HR and publish approved content to the AI indexer.</p>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        {selectedApproval ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedApproval.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{selectedApproval.category ?? "Uncategorized"} • {selectedApproval.writer?.name ?? "Unknown author"}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(selectedApproval.status)}`}>
                {selectedApproval.status ?? "pending"}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-700">{selectedApproval.content}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => void handleApprove(selectedApproval)}
                className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => void handleReject(selectedApproval)}
                className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Reject
              </button>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Created Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {approvals.map((approval) => (
                <tr key={approval.articleId} className="text-slate-800">
                  <td className="px-4 py-4 font-medium">{approval.title}</td>
                  <td className="px-4 py-4">{approval.category ?? "-"}</td>
                  <td className="px-4 py-4">{approval.writer?.name ?? "-"}</td>
                  <td className="px-4 py-4">{formatDate(approval.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(approval.status)}`}>
                      {approval.status ?? "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedApproval(approval)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleApprove(approval)}
                        className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReject(approval)}
                        className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !approvals.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No pending knowledge base approvals.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}