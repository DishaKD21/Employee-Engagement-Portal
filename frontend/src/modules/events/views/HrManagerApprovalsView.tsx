"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import ApprovalTable from "../components/ApprovalTable";
import { approveEvent, getPendingApprovals, rejectEvent, type ApprovalRecord } from "../services/event.service";

export default function HrManagerApprovalsView() {
  const token = useAuthStore((state) => state.token);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRecord | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadApprovals() {
    if (!token) return;
    try {
      setApprovals(await getPendingApprovals(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load approvals"));
    }
  }

  useEffect(() => {
    void loadApprovals(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (approval: ApprovalRecord) => {
    if (!token) return;
    try {
      await approveEvent(approval.approvalId, token);
      setMessage("Event approved and published.");
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to approve event"));
    }
  };

  const handleReject = async (approval: ApprovalRecord) => {
    if (!token) return;
    const comments = window.prompt("Enter rejection comments (optional)") ?? undefined;
    try {
      await rejectEvent(approval.approvalId, token, comments);
      setMessage("Event rejected.");
      await loadApprovals();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to reject event"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Event Approvals</h1>
          <p className="mt-2 text-slate-600">Review pending event submissions from HR.</p>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        {selectedApproval ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{selectedApproval.event?.eventName}</h2>
            <p className="mt-2 text-sm text-slate-600">{selectedApproval.event?.description}</p>
            <p className="mt-3 text-sm text-slate-500">Created By: {selectedApproval.event?.creator?.name}</p>
            <p className="text-sm text-slate-500">Target Audience: {selectedApproval.event?.targetAudience}</p>
          </div>
        ) : null}

        <ApprovalTable
          approvals={approvals}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={(approval) => setSelectedApproval(approval)}
        />
      </div>
    </div>
  );
}