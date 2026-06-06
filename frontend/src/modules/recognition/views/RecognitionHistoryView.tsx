"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "@mantine/core";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import { getRecognitionEvents, type RecognitionEventRecord } from "../services/recognition.service";
import RecognitionCard from "../components/RecognitionCard";
import DeliveryStatusTable from "../components/DeliveryStatusTable";
import { DataViewport, EmptyState, EnterpriseCard, PaginationBar, SectionHeader } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

export default function RecognitionHistoryView() {
  const token = useAuthStore((state) => state.token);
  const [events, setEvents] = useState<RecognitionEventRecord[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<RecognitionEventRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const pagination = useClientPagination(events);
  const selection = useRowSelection(pagination.paginatedItems.map((event) => event.eventId), events.map((event) => event.eventId));

  async function loadEvents() {
    if (!token) return;

    try {
      const result = await getRecognitionEvents(token);
      setEvents(result);
      setSelectedEvent((current) => current ?? result[0] ?? null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load recognition history"));
    }
  }

  useEffect(() => {
    void loadEvents(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Recognition" title="Recognition history" description="Daily automated birthdays and anniversaries tracked by the scheduler." />

      {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <Checkbox checked={selection.allVisibleSelected} indeterminate={selection.someVisibleSelected} onChange={selection.toggleVisible} label="Select all" />
        <span>{selection.selectedCount} items selected</span>
        {selection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={selection.clearSelection}>Deselect all</button> : null}
      </div>

      <DataViewport height={620}>
      <div className="grid gap-4 pr-3 md:grid-cols-2 xl:grid-cols-3">
        {pagination.paginatedItems.map((event) => (
          <div key={event.eventId} className="relative">
            <Checkbox className="absolute left-3 top-3 z-[1] rounded bg-white p-1 shadow-sm" checked={selection.selectedSet.has(event.eventId)} onChange={() => selection.toggleOne(event.eventId)} aria-label={`Select recognition ${event.eventId}`} />
          <RecognitionCard
            title={event.employeeName ?? "Employee"}
            subtitle={`${event.eventType ?? "Recognition"} • ${event.triggerDate ?? "-"}`}
            description={event.template?.content ?? "Automated recognition entry"}
            badge={event.deliveryStatus ?? "pending"}
            onClick={() => setSelectedEvent(event)}
          />
          </div>
        ))}

        {!events.length ? <div className="md:col-span-2 xl:col-span-3"><EmptyState title="No recognition events yet." description="Recognition history will appear here once generated." /></div> : null}
      </div>
      </DataViewport>
      <PaginationBar {...pagination} onChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />

      {selectedEvent ? (
        <EnterpriseCard className="space-y-4 p-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{selectedEvent.employeeName}</h3>
            <p className="text-sm text-slate-600">{selectedEvent.eventType} • {selectedEvent.triggerDate}</p>
            <p className="mt-2 text-sm text-slate-500">Template: {selectedEvent.template?.templateName ?? "-"}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{selectedEvent.template?.content ?? "No template content available."}</div>

          <DeliveryStatusTable events={[selectedEvent]} />
        </EnterpriseCard>
      ) : null}
    </div>
  );
}
