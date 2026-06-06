"use client";

import React from "react";
import { Checkbox, Modal } from "@mantine/core";
import { Trash2 } from "lucide-react";
import type { SurveyRecord } from "../services/survey.service";
import { DataTableShell, DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseInput, EnterpriseSelect, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

type Props = {
  surveys: SurveyRecord[];
  onEdit?: (survey: SurveyRecord) => void;
  onDelete?: (survey: SurveyRecord) => void;
  onView?: (survey: SurveyRecord) => void;
};

function statusTone(status?: string | null) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function SurveyTable({ surveys, onEdit, onDelete, onView }: Props) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortOrder, setSortOrder] = React.useState("newest");
  const filteredSurveys = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return surveys
      .filter((survey) => {
        const status = (survey.workflowStatus ?? survey.approvedStatus ?? "pending").toLowerCase();
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const searchable = [survey.title, survey.targetAudience].filter(Boolean).join(" ").toLowerCase();
        return matchesStatus && (!query || searchable.includes(query));
      })
      .sort((first, second) => {
        const firstTime = new Date(first.openDate ?? first.createdAt ?? 0).getTime();
        const secondTime = new Date(second.openDate ?? second.createdAt ?? 0).getTime();
        return sortOrder === "oldest" ? firstTime - secondTime : secondTime - firstTime;
      });
  }, [search, sortOrder, statusFilter, surveys]);
  const pagination = useClientPagination(filteredSurveys);
  const selection = useRowSelection(
    pagination.paginatedItems.map((survey) => survey.surveyId),
    filteredSurveys.map((survey) => survey.surveyId),
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const deleteSelected = () => {
    if (!onDelete) return;

    filteredSurveys.filter((survey) => selection.selectedSet.has(survey.surveyId)).forEach((survey) => onDelete(survey));
    selection.clearSelection();
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-3">
      <Modal opened={confirmOpen} onClose={() => setConfirmOpen(false)} title={`Delete ${selection.selectedCount} selected records?`} centered>
        <p className="text-sm text-slate-600">This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <EnterpriseButton variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</EnterpriseButton>
          <EnterpriseButton variant="danger" onClick={deleteSelected}>Delete</EnterpriseButton>
        </div>
      </Modal>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
          <span>{selection.selectedCount} items selected</span>
          {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
        </div>
        {onDelete ? (
          <EnterpriseButton variant="danger" disabled={!selection.selectedCount} onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </EnterpriseButton>
        ) : null}
      </div>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <EnterpriseInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search surveys..." />
        <EnterpriseSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </EnterpriseSelect>
        <EnterpriseSelect value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </EnterpriseSelect>
      </div>
      <DataTableShell>
        <DataViewport>
          <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 z-[1] bg-slate-50 text-slate-600">
          <tr>
            <th className="w-12 px-5 py-3 font-semibold"></th>
            <th className="px-5 py-3 font-semibold">Survey Title</th>
            <th className="px-5 py-3 font-semibold">Open Date</th>
            <th className="px-5 py-3 font-semibold">Close Date</th>
            <th className="px-5 py-3 font-semibold">Approval Status</th>
            <th className="px-5 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {pagination.paginatedItems.map((survey) => (
            <tr key={survey.surveyId} className="text-slate-800 hover:bg-slate-50/80">
              <td className="px-5 py-4">
                <Checkbox checked={selection.selectedSet.has(survey.surveyId)} onChange={() => selection.toggleOne(survey.surveyId)} aria-label={`Select ${survey.title ?? "survey"}`} />
              </td>
              <td className="px-5 py-4 font-medium text-slate-900">{survey.title}</td>
              <td className="px-5 py-4">{formatDate(survey.openDate)}</td>
              <td className="px-5 py-4">{formatDate(survey.closeDate)}</td>
              <td className="px-5 py-4">
                <EnterpriseBadge tone={statusTone(survey.workflowStatus ?? survey.approvedStatus)}>
                  {survey.workflowStatus ?? survey.approvedStatus ?? "pending"}
                </EnterpriseBadge>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {onView ? <EnterpriseButton variant="secondary" onClick={() => onView(survey)}>View</EnterpriseButton> : null}
                  {onEdit ? <EnterpriseButton variant="secondary" onClick={() => onEdit(survey)}>Edit</EnterpriseButton> : null}
                  {onDelete ? <EnterpriseButton variant="danger" onClick={() => onDelete(survey)}>Delete</EnterpriseButton> : null}
                </div>
              </td>
            </tr>
          ))}
          {!filteredSurveys.length ? (
            <tr>
              <td colSpan={6} className="px-5 py-8">
                <EmptyState title="No surveys found." description="Create or adjust filters to see survey records here." />
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
