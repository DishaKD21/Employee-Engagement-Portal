"use client";

import React from "react";
import type { EventRecord } from "../services/event.service";

type Props = {
  event: EventRecord;
  onRegister?: (event: EventRecord) => void;
  isRegistered?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function EventCard({ event, onRegister, isRegistered }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{event.eventName}</h3>
          <p className="mt-2 text-sm text-slate-600">{event.description || "No description provided."}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {event.eventType}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p><span className="font-medium text-slate-900">Event date:</span> {formatDate(event.eventDate)}</p>
        <p><span className="font-medium text-slate-900">Target audience:</span> {event.targetAudience}</p>
      </div>

      <button
        type="button"
        onClick={() => onRegister?.(event)}
        disabled={!onRegister || isRegistered}
        className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRegistered ? "Registered" : "Register"}
      </button>
    </article>
  );
}