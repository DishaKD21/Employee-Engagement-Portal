"use client";

import React from "react";
import { Checkbox } from "@mantine/core";
import type { SurveyApprovalRecord } from "../services/survey.service";
import { DataTableShell, DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseInput, EnterpriseSelect, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

type Props = {
  approvals: SurveyApprovalRecord[];
  onApprove?: (approval: SurveyApprovalRecord) => void;
  onReject?: (approval: SurveyApprovalRecord) => void;
  onView?: (approval: SurveyApprovalRecord) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function ApprovalSurveyTable({ approvals, onApprove, onReject, onView }: Props) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const filteredApprovals = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return approvals.filter((approval) => {
      const status = (approval.status ?? "pending").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const searchable = [approval.survey?.title, approval.survey?.creator?.name, approval.survey?.targetAudience].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [approvals, search, statusFilter]);
  const pagination = useClientPagination(filteredApprovals);
  const selection = useRowSelection(
    pagination.paginatedItems.map((approval) => approval.approvalId),
    filteredApprovals.map((approval) => approval.approvalId),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
        <span>{selection.selectedCount} items selected</span>
        {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <EnterpriseInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search survey approvals..." />
        <EnterpriseSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </EnterpriseSelect>
      </div>
      <DataTableShell>
        <DataViewport>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="sticky top-0 z-[1] bg-slate-50 text-slate-600">
          <tr>
            <th className="w-12 px-4 py-3 font-medium"></th>
            <th className="px-4 py-3 font-medium">Survey Title</th>
            <th className="px-4 py-3 font-medium">Created By</th>
            <th className="px-4 py-3 font-medium">Open Date</th>
            <th className="px-4 py-3 font-medium">Approval Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagination.paginatedItems.map((approval) => (
            <tr key={approval.approvalId} className="text-slate-800">
              <td className="px-4 py-4">
                <Checkbox checked={selection.selectedSet.has(approval.approvalId)} onChange={() => selection.toggleOne(approval.approvalId)} aria-label={`Select approval ${approval.approvalId}`} />
              </td>
              <td className="px-4 py-4 font-medium">{approval.survey?.title}</td>
              <td className="px-4 py-4">{approval.survey?.creator?.name ?? "-"}</td>
              <td className="px-4 py-4">{formatDate(approval.survey?.openDate)}</td>
              <td className="px-4 py-4">
                <EnterpriseBadge tone={approval.status?.toLowerCase() === "approved" ? "approved" : approval.status?.toLowerCase() === "rejected" ? "rejected" : "pending"}>
                  {approval.status ?? "pending"}
                </EnterpriseBadge>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {onView ? <EnterpriseButton type="button" variant="secondary" onClick={() => onView(approval)}>View Details</EnterpriseButton> : null}
                  {onApprove ? <EnterpriseButton type="button" variant="primary" onClick={() => onApprove(approval)}>Approve</EnterpriseButton> : null}
                  {onReject ? <EnterpriseButton type="button" variant="danger" onClick={() => onReject(approval)}>Reject</EnterpriseButton> : null}
                </div>
              </td>
            </tr>
          ))}
          {!filteredApprovals.length ? (
            <tr>
              <td colSpan={6} className="px-4 py-8">
                <EmptyState title="No survey approvals found." description="Survey approvals matching this view will appear here." />
              </td>
            </tr>
          ) : null}
        </tbody>
          </table>
          </div>
        </DataViewport>
      </DataTableShell>
      <PaginationBar {...pagination} onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
    </div>
  );
}
