"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import RecognitionCard from "../components/RecognitionCard";
import {
  approveRecognitionTemplate,
  getTemplateApprovals,
  rejectRecognitionTemplate,
  type RecognitionApprovalRecord,
} from "../services/recognition.service";

export default function TemplateApprovalsView() {
  const token = useAuthStore((state) => state.token);
  const [approvals, setApprovals] = useState<RecognitionApprovalRecord[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<RecognitionApprovalRecord | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadApprovals() {
    if (!token) return;

    try {
      setApprovals(await getTemplateApprovals(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load template approvals"));
    }
  }

  useEffect(() => {
    void loadApprovals();
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
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Template Approvals</h1>
          <p className="mt-2 text-slate-600">Review recognition templates before they become active in the scheduler.</p>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        {selectedApproval ? (
          <RecognitionCard
            title={selectedApproval.template?.templateName ?? "Pending Template"}
            subtitle={`${selectedApproval.template?.eventType ?? "Recognition"} • v${selectedApproval.template?.version ?? 1}`}
            description={selectedApproval.template?.content}
            badge={selectedApproval.status ?? "pending"}
            footer={<p className="text-xs text-slate-500">Created At: {selectedApproval.createdAt}</p>}
          />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {approvals.map((approval) => (
            <RecognitionCard
              key={approval.approvalId}
              title={approval.template?.templateName ?? "Pending Template"}
              subtitle={`${approval.template?.eventType ?? "Recognition"} • v${approval.template?.version ?? 1}`}
              description={approval.template?.content}
              badge={approval.status ?? "pending"}
              onClick={() => setSelectedApproval(approval)}
              footer={
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void handleApprove(approval)} className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                    Approve
                  </button>
                  <button type="button" onClick={() => void handleReject(approval)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                    Reject
                  </button>
                </div>
              }
            />
          ))}

          {!approvals.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">No pending template approvals.</div> : null}
        </div>
      </div>
    </div>
  );
}