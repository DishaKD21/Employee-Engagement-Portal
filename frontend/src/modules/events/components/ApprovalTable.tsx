"use client";

import React from "react";
import { Checkbox } from "@mantine/core";
import type { ApprovalRecord } from "../services/event.service";
import { DataTableShell, DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseInput, EnterpriseSelect, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

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
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const filteredApprovals = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return approvals.filter((approval) => {
      const status = (approval.status ?? "pending").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const searchable = [approval.event?.eventName, approval.event?.creator?.name, approval.event?.targetAudience].filter(Boolean).join(" ").toLowerCase();
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
        <EnterpriseInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search approvals..." />
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
        <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 z-[1] bg-slate-50 text-slate-600">
          <tr>
            <th className="w-12 px-5 py-3 font-semibold"></th>
            <th className="px-5 py-3 font-semibold">Event Name</th>
            <th className="px-5 py-3 font-semibold">Created By</th>
            <th className="px-5 py-3 font-semibold">Event Date</th>
            <th className="px-5 py-3 font-semibold">Approval Status</th>
            <th className="px-5 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {pagination.paginatedItems.map((approval) => (
            <tr key={approval.approvalId} className="text-slate-800 hover:bg-slate-50/80">
              <td className="px-5 py-4">
                <Checkbox checked={selection.selectedSet.has(approval.approvalId)} onChange={() => selection.toggleOne(approval.approvalId)} aria-label={`Select approval ${approval.approvalId}`} />
              </td>
              <td className="px-5 py-4 font-medium text-slate-900">{approval.event?.eventName}</td>
              <td className="px-5 py-4">{approval.event?.creator?.name ?? "-"}</td>
              <td className="px-5 py-4">{formatDate(approval.event?.eventDate)}</td>
              <td className="px-5 py-4">
                <EnterpriseBadge tone={approval.status?.toLowerCase() === "approved" ? "approved" : approval.status?.toLowerCase() === "rejected" ? "rejected" : "pending"}>
                  {approval.status ?? "pending"}
                </EnterpriseBadge>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {onView ? <EnterpriseButton variant="secondary" onClick={() => onView(approval)}>View Details</EnterpriseButton> : null}
                  {onApprove ? <EnterpriseButton variant="primary" onClick={() => onApprove(approval)}>Approve</EnterpriseButton> : null}
                  {onReject ? <EnterpriseButton variant="danger" onClick={() => onReject(approval)}>Reject</EnterpriseButton> : null}
                </div>
              </td>
            </tr>
          ))}
          {!filteredApprovals.length ? (
            <tr>
              <td colSpan={6} className="px-5 py-8">
                <EmptyState title="No approvals found." description="Approval records matching this view will appear here." />
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
