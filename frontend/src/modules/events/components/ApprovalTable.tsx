"use client";

import React from "react";
import type { ApprovalRecord } from "../services/event.service";

type Props = {
  approvals: ApprovalRecord[];
  onApprove?: (approval: ApprovalRecord) => void;
  onReject?: (approval: ApprovalRecord) => void;
  onView?: (approval: ApprovalRecord) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function ApprovalTable({ approvals, onApprove, onReject, onView }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Event Name</th>
            <th className="px-4 py-3 font-medium">Created By</th>
            <th className="px-4 py-3 font-medium">Event Date</th>
            <th className="px-4 py-3 font-medium">Approval Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {approvals.map((approval) => (
            <tr key={approval.approvalId} className="text-slate-800">
              <td className="px-4 py-4 font-medium">{approval.event?.eventName}</td>
              <td className="px-4 py-4">{approval.event?.creator?.name ?? "-"}</td>
              <td className="px-4 py-4">{formatDate(approval.event?.eventDate)}</td>
              <td className="px-4 py-4">{approval.status}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {onView ? <button onClick={() => onView(approval)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50">View Details</button> : null}
                  {onApprove ? <button onClick={() => onApprove(approval)} className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Approve</button> : null}
                  {onReject ? <button onClick={() => onReject(approval)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Reject</button> : null}
                </div>
              </td>
            </tr>
          ))}
          {!approvals.length ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No pending approvals.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}