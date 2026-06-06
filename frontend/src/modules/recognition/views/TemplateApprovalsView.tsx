"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "@mantine/core";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import RecognitionCard from "../components/RecognitionCard";
import {
  approveRecognitionTemplate,
  getTemplateApprovals,
  rejectRecognitionTemplate,
  type RecognitionApprovalRecord,
} from "../services/recognition.service";
import { DataViewport, EmptyState, EnterpriseButton, EnterpriseCard, PaginationBar, SectionHeader } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

export default function TemplateApprovalsView() {
  const token = useAuthStore((state) => state.token);
  const [approvals, setApprovals] = useState<RecognitionApprovalRecord[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<RecognitionApprovalRecord | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const pagination = useClientPagination(approvals);
  const selection = useRowSelection(pagination.paginatedItems.map((approval) => approval.approvalId), approvals.map((approval) => approval.approvalId));

  async function loadApprovals() {
    if (!token) return;

    try {
      setApprovals(await getTemplateApprovals(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load template approvals"));
    }
  }

  useEffect(() => {
    void loadApprovals(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]);

  const handleApprove = async (approval: RecognitionApprovalRecord) => {
    if (!token) return;

    try {
      await approveRecognitionTemplate(approval.approvalId, token);
      setMessage("Template approved and activated.");
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to approve template"));
    }
  };

  const handleReject = async (approval: RecognitionApprovalRecord) => {
    if (!token) return;
    const comments = window.prompt("Enter rejection comments (optional)") ?? undefined;

    try {
      await rejectRecognitionTemplate(approval.approvalId, token, comments);
      setMessage("Template rejected.");
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to reject template"));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Recognition" title="Template approvals" description="Review recognition templates before they become active in the scheduler." />

      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      {selectedApproval ? (
        <EnterpriseCard className="p-5">
          <RecognitionCard
            title={selectedApproval.template?.templateName ?? "Pending Template"}
            subtitle={`${selectedApproval.template?.eventType ?? "Recognition"} • v${selectedApproval.template?.version ?? 1}`}
            description={selectedApproval.template?.content}
            badge={selectedApproval.status ?? "pending"}
            footer={<p className="text-xs text-slate-500">Created At: {selectedApproval.createdAt}</p>}
          />
        </EnterpriseCard>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
        <span>{selection.selectedCount} items selected</span>
        {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
      </div>

      <DataViewport height={620}>
      <div className="grid gap-4 pr-3 md:grid-cols-2 xl:grid-cols-3">
        {pagination.paginatedItems.map((approval) => (
          <div key={approval.approvalId} className="relative">
            <Checkbox className="absolute left-3 top-3 z-[1] rounded bg-white p-1 shadow-sm" checked={selection.selectedSet.has(approval.approvalId)} onChange={() => selection.toggleOne(approval.approvalId)} aria-label={`Select approval ${approval.approvalId}`} />
          <RecognitionCard
            title={approval.template?.templateName ?? "Pending Template"}
            subtitle={`${approval.template?.eventType ?? "Recognition"} • v${approval.template?.version ?? 1}`}
            description={approval.template?.content}
            badge={approval.status ?? "pending"}
            onClick={() => setSelectedApproval(approval)}
            footer={
              <div className="flex flex-wrap gap-2">
                <EnterpriseButton type="button" variant="secondary" onClick={() => void handleApprove(approval)}>Approve</EnterpriseButton>
                <EnterpriseButton type="button" variant="danger" onClick={() => void handleReject(approval)}>Reject</EnterpriseButton>
              </div>
            }
          />
          </div>
        ))}

        {!approvals.length ? <div className="md:col-span-2 xl:col-span-3"><EmptyState title="No pending template approvals." description="Recognition template approvals will appear here." /></div> : null}
      </div>
      </DataViewport>
      <PaginationBar {...pagination} onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}
