"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@mantine/core";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import EventCard from "../components/EventCard";
import { getMyRegistrations, getPublishedEvents, registerForEvent, type EventRecord, type RegistrationRecord } from "../services/event.service";
import { DataViewport, EmptyState, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

export default function EmployeeEventsView() {
  const token = useAuthStore((state) => state.token);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadEvents() {
    if (!token) return;
    try {
      const [publishedEvents, myRegs] = await Promise.all([
        getPublishedEvents(token),
        getMyRegistrations(token),
      ]);
      setEvents(publishedEvents);
      setRegistrations(myRegs);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load events"));
    }
  }

  useEffect(() => {
    void loadEvents(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const registeredIds = useMemo(() => new Set(registrations.map((registration) => registration.eventId).filter((value): value is number => value !== null)), [registrations]);
  const upcomingEvents = useMemo(() => events.filter((event) => !event.eventDate || new Date(event.eventDate) >= new Date()), [events]);
  const pastEvents = useMemo(() => events.filter((event) => event.eventDate && new Date(event.eventDate) < new Date()), [events]);
  const upcomingPagination = useClientPagination(upcomingEvents);
  const pastPagination = useClientPagination(pastEvents);
  const registrationPagination = useClientPagination(registrations);
  const upcomingSelection = useRowSelection(upcomingPagination.paginatedItems.map((event) => event.eventId), upcomingEvents.map((event) => event.eventId));
  const pastSelection = useRowSelection(pastPagination.paginatedItems.map((event) => event.eventId), pastEvents.map((event) => event.eventId));
  const registrationSelection = useRowSelection(registrationPagination.paginatedItems.map((registration) => registration.id), registrations.map((registration) => registration.id));

  const handleRegister = async (event: EventRecord) => {
    if (!token) return;

    try {
      await registerForEvent(event.eventId, token);
      setMessage(`Registered for ${event.eventName}`);
      await loadEvents();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to register for event"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Events</h1>
          <p className="mt-2 text-slate-600">Browse approved and published events and register directly.</p>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Upcoming Events</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Checkbox checked={upcomingSelection.allVisibleSelected} indeterminate={upcomingSelection.someVisibleSelected} onChange={upcomingSelection.toggleVisible} label="Select all" />
            <span>{upcomingSelection.selectedCount} items selected</span>
            {upcomingSelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={upcomingSelection.clearSelection}>Deselect all</button> : null}
          </div>
          <DataViewport height={620}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingPagination.paginatedItems.map((event) => (
              <div key={event.eventId} className="relative">
                <Checkbox className="absolute left-3 top-3 z-[1] rounded bg-white p-1 shadow-sm" checked={upcomingSelection.selectedSet.has(event.eventId)} onChange={() => upcomingSelection.toggleOne(event.eventId)} aria-label={`Select ${event.eventName ?? "event"}`} />
              <EventCard
                event={event}
                onRegister={handleRegister}
                isRegistered={registeredIds.has(event.eventId)}
              />
              </div>
            ))}
            {!upcomingEvents.length ? <div className="md:col-span-2 xl:col-span-3"><EmptyState title="No upcoming events." description="Published upcoming events will appear here." /></div> : null}
          </div>
          </DataViewport>
          <PaginationBar {...upcomingPagination} onChange={upcomingPagination.setPage} onPageSizeChange={upcomingPagination.setPageSize} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Past Events</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Checkbox checked={pastSelection.allVisibleSelected} indeterminate={pastSelection.someVisibleSelected} onChange={pastSelection.toggleVisible} label="Select all" />
            <span>{pastSelection.selectedCount} items selected</span>
            {pastSelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={pastSelection.clearSelection}>Deselect all</button> : null}
          </div>
          <DataViewport height={620}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pastPagination.paginatedItems.map((event) => (
              <div key={event.eventId} className="relative">
                <Checkbox className="absolute left-3 top-3 z-[1] rounded bg-white p-1 shadow-sm" checked={pastSelection.selectedSet.has(event.eventId)} onChange={() => pastSelection.toggleOne(event.eventId)} aria-label={`Select ${event.eventName ?? "event"}`} />
              <EventCard
                event={event}
                onRegister={handleRegister}
                isRegistered={registeredIds.has(event.eventId)}
              />
              </div>
            ))}
            {!pastEvents.length ? <div className="md:col-span-2 xl:col-span-3"><EmptyState title="No past events." description="Completed events will appear here." /></div> : null}
          </div>
          </DataViewport>
          <PaginationBar {...pastPagination} onChange={pastPagination.setPage} onPageSizeChange={pastPagination.setPageSize} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">My Registrations</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Checkbox checked={registrationSelection.allVisibleSelected} indeterminate={registrationSelection.someVisibleSelected} onChange={registrationSelection.toggleVisible} label="Select all" />
            <span>{registrationSelection.selectedCount} items selected</span>
            {registrationSelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={registrationSelection.clearSelection}>Deselect all</button> : null}
          </div>
          <DataViewport height={500} className="mt-4">
          <div className="space-y-3 pr-3 text-sm text-slate-600">
            {registrationPagination.paginatedItems.map((registration) => (
              <div key={registration.id} className="rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-start gap-3">
                <Checkbox checked={registrationSelection.selectedSet.has(registration.id)} onChange={() => registrationSelection.toggleOne(registration.id)} aria-label={`Select registration ${registration.id}`} />
                <div>
                <p className="font-medium text-slate-900">{registration.event?.eventName}</p>
                <p>{registration.event?.eventDate?.slice(0, 10)}</p>
                </div>
                </div>
              </div>
            ))}
            {!registrations.length ? <EmptyState title="No registrations yet." description="Events you register for will appear here." /> : null}
          </div>
          </DataViewport>
          <div className="mt-4">
            <PaginationBar {...registrationPagination} onChange={registrationPagination.setPage} onPageSizeChange={registrationPagination.setPageSize} />
          </div>
        </div>
      </div>
    </div>
  );
}
