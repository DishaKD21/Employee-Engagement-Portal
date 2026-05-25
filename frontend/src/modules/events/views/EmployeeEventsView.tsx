"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import EventCard from "../components/EventCard";
import { getMyRegistrations, getPublishedEvents, registerForEvent, type EventRecord, type RegistrationRecord } from "../services/event.service";

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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.eventId}
              event={event}
              onRegister={handleRegister}
              isRegistered={registeredIds.has(event.eventId)}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">My Registrations</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {registrations.map((registration) => (
              <div key={registration.id} className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">{registration.event?.eventName}</p>
                <p>{registration.event?.eventDate?.slice(0, 10)}</p>
              </div>
            ))}
            {!registrations.length ? <p>No registrations yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}