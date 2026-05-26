"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import { getRecognitionEvents, type RecognitionEventRecord } from "../services/recognition.service";
import RecognitionCard from "../components/RecognitionCard";
import DeliveryStatusTable from "../components/DeliveryStatusTable";

export default function RecognitionHistoryView() {
  const token = useAuthStore((state) => state.token);
  const [events, setEvents] = useState<RecognitionEventRecord[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<RecognitionEventRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
    void loadEvents();
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Recognition History</h2>
        <p className="mt-2 text-sm text-slate-600">Daily automated birthdays and anniversaries tracked by the scheduler.</p>
      </div>

      {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <RecognitionCard
            key={event.eventId}
            title={event.employeeName ?? "Employee"}
            subtitle={`${event.eventType ?? "Recognition"} • ${event.triggerDate ?? "-"}`}
            description={event.template?.content ?? "Automated recognition entry"}
            badge={event.deliveryStatus ?? "pending"}
            onClick={() => setSelectedEvent(event)}
          />
        ))}

        {!events.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">No recognition events yet.</div> : null}
      </div>

      {selectedEvent ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{selectedEvent.employeeName}</h3>
            <p className="text-sm text-slate-600">{selectedEvent.eventType} • {selectedEvent.triggerDate}</p>
            <p className="mt-2 text-sm text-slate-500">Template: {selectedEvent.template?.templateName ?? "-"}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            {selectedEvent.template?.content ?? "No template content available."}
          </div>

          <DeliveryStatusTable events={[selectedEvent]} />
        </div>
      ) : null}
    </div>
  );
}