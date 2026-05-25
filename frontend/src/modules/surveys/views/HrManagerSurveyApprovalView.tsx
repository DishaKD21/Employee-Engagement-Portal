"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import ApprovalSurveyTable from "../components/ApprovalSurveyTable";
import { approveSurvey, getPendingSurveyApprovals, rejectSurvey, type SurveyApprovalRecord } from "../services/survey.service";

export default function HrManagerSurveyApprovalView() {
  const token = useAuthStore((state) => state.token);
  const [approvals, setApprovals] = useState<SurveyApprovalRecord[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<SurveyApprovalRecord | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadApprovals() {
    if (!token) return;

    try {
      setApprovals(await getPendingSurveyApprovals(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load survey approvals"));
    }
  }

  useEffect(() => {
    void loadApprovals(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (approval: SurveyApprovalRecord) => {
    if (!token) return;

    try {
      await approveSurvey(approval.approvalId, token);
      setMessage("Survey approved and published.");
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to approve survey"));
    }
  };

  const handleReject = async (approval: SurveyApprovalRecord) => {
    if (!token) return;
    const comments = window.prompt("Enter rejection comments (optional)") ?? undefined;

    try {
      await rejectSurvey(approval.approvalId, token, comments);
      setMessage("Survey rejected.");
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to reject survey"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Survey Approvals</h1>
          <p className="mt-2 text-slate-600">Review pending survey submissions from HR.</p>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        {selectedApproval ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">{selectedApproval.survey?.title}</h2>
            <p className="text-sm text-slate-600">{selectedApproval.survey?.targetAudience}</p>
            <p className="text-sm text-slate-500">Questions: {(selectedApproval.survey?.questions ?? []).length}</p>
          </div>
        ) : null}

        <ApprovalSurveyTable
          approvals={approvals}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={(approval) => setSelectedApproval(approval)}
        />
      </div>
    </div>
  );
}
