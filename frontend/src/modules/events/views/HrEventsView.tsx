"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import EventForm from "../components/EventForm";
import EventTable from "../components/EventTable";
import { createEvent, deleteEvent, getMyEvents, updateEvent, type EventFormValues, type EventRecord } from "../services/event.service";

export default function HrEventsView() {
  const token = useAuthStore((state) => state.token);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues = useMemo<Partial<EventFormValues> | undefined>(() => {
    if (!editingEvent) return undefined;

    return {
      event_name: editingEvent.eventName ?? "",
      event_type: editingEvent.eventType ?? "",
      description: editingEvent.description ?? "",
      target_audience: editingEvent.targetAudience ?? "",
      registration_start: editingEvent.registrationStart?.slice(0, 10) ?? "",
      registration_end: editingEvent.registrationEnd?.slice(0, 10) ?? "",
      event_date: editingEvent.eventDate?.slice(0, 10) ?? "",
    };
  }, [editingEvent]);

  async function loadEvents() {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      setEvents(await getMyEvents(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load events"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: EventFormValues) => {
    if (!token) return;

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.eventId, values, token);
        setMessage("Event updated and submitted for approval.");
      } else {
        await createEvent(values, token);
        setMessage("Event submitted for approval.");
      }

      setEditingEvent(null);
      setFormVisible(false);
      await loadEvents();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to save event"));
    }
  };

  const handleDelete = async (event: EventRecord) => {
    if (!token) return;
    if (!window.confirm(`Delete ${event.eventName}?`)) return;

    try {
      await deleteEvent(event.eventId, token);
      setMessage("Event deleted.");
      await loadEvents();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete event"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">HR Events</h1>
            <p className="mt-2 text-slate-600">Create events and submit them for HR Manager approval.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingEvent(null);
              setFormVisible((current) => !current);
            }}
            className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Create Event
          </button>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        {formVisible ? (
          <EventForm
            key={editingEvent?.eventId ?? "create-event"}
            title={editingEvent ? "Edit Event" : "Create Event"}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormVisible(false);
              setEditingEvent(null);
            }}
            submitLabel="Submit For Approval"
          />
        ) : null}

        {selectedEvent ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{selectedEvent.eventName}</h2>
            <p className="mt-2 text-sm text-slate-600">{selectedEvent.description}</p>
            <p className="mt-3 text-sm text-slate-500">Event Type: {selectedEvent.eventType}</p>
            <p className="text-sm text-slate-500">Target Audience: {selectedEvent.targetAudience}</p>
          </div>
        ) : null}

        {isLoading ? <p className="text-sm text-slate-500">Loading events...</p> : null}

        <EventTable
          events={events}
          onEdit={(event) => {
            setEditingEvent(event);
            setFormVisible(true);
          }}
          onDelete={handleDelete}
          onView={(event) => setSelectedEvent(event)}
        />
      </div>
    </div>
  );
}