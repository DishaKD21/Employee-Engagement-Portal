"use client";

import React from "react";
import { Checkbox, Modal } from "@mantine/core";
import { Trash2 } from "lucide-react";
import type { EventRecord } from "../services/event.service";
import { DataTableShell, DataViewport, EmptyState, EnterpriseBadge, EnterpriseButton, EnterpriseInput, EnterpriseSelect, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

type Props = {
  events: EventRecord[];
  onEdit?: (event: EventRecord) => void;
  onDelete?: (event: EventRecord) => void;
  onView?: (event: EventRecord) => void;
};

function statusTone(status?: string | null) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "approved" || normalized === "published") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function EventTable({ events, onEdit, onDelete, onView }: Props) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortOrder, setSortOrder] = React.useState("newest");
  const filteredEvents = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => {
        const status = (event.workflowStatus ?? event.approvedStatus ?? "pending").toLowerCase();
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const searchable = [event.eventName, event.eventType, event.targetAudience, event.description].filter(Boolean).join(" ").toLowerCase();
        return matchesStatus && (!query || searchable.includes(query));
      })
      .sort((first, second) => {
        const firstTime = new Date(first.eventDate ?? 0).getTime();
        const secondTime = new Date(second.eventDate ?? 0).getTime();
        return sortOrder === "oldest" ? firstTime - secondTime : secondTime - firstTime;
      });
  }, [events, search, sortOrder, statusFilter]);
  const pagination = useClientPagination(filteredEvents);
  const selection = useRowSelection(
    pagination.paginatedItems.map((event) => event.eventId),
    filteredEvents.map((event) => event.eventId),
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const deleteSelected = () => {
    if (!onDelete) return;

    filteredEvents.filter((event) => selection.selectedSet.has(event.eventId)).forEach((event) => onDelete(event));
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
          <Checkbox
            checked={selection.allVisibleSelected}
            indeterminate={selection.someVisibleSelected}
            onChange={selection.toggleVisible}
            label="Select all"
          />
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
        <EnterpriseInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events..." />
        <EnterpriseSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
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
            <th className="px-5 py-3 font-semibold">Event Name</th>
            <th className="px-5 py-3 font-semibold">Event Date</th>
            <th className="px-5 py-3 font-semibold">Approval Status</th>
            <th className="px-5 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {pagination.paginatedItems.map((event) => (
            <tr key={event.eventId} className="text-slate-800 hover:bg-slate-50/80">
              <td className="px-5 py-4">
                <Checkbox checked={selection.selectedSet.has(event.eventId)} onChange={() => selection.toggleOne(event.eventId)} aria-label={`Select ${event.eventName ?? "event"}`} />
              </td>
              <td className="px-5 py-4 font-medium text-slate-900">{event.eventName}</td>
              <td className="px-5 py-4">{formatDate(event.eventDate)}</td>
              <td className="px-5 py-4">
                <EnterpriseBadge tone={statusTone(event.workflowStatus ?? event.approvedStatus) as never}>
                  {event.workflowStatus ?? event.approvedStatus ?? "pending"}
                </EnterpriseBadge>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {onView ? <EnterpriseButton variant="secondary" onClick={() => onView(event)}>View</EnterpriseButton> : null}
                  {onEdit ? <EnterpriseButton variant="secondary" onClick={() => onEdit(event)}>Edit</EnterpriseButton> : null}
                  {onDelete ? <EnterpriseButton variant="danger" onClick={() => onDelete(event)}>Delete</EnterpriseButton> : null}
                </div>
              </td>
            </tr>
          ))}
          {!filteredEvents.length ? (
            <tr>
              <td colSpan={5} className="px-5 py-8">
                <EmptyState title="No events found." description="Create or adjust filters to see event records here." />
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
