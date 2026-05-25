"use client";

import React from "react";
import type { EventRecord } from "../services/event.service";

type Props = {
  events: EventRecord[];
  onEdit?: (event: EventRecord) => void;
  onDelete?: (event: EventRecord) => void;
  onView?: (event: EventRecord) => void;
};

function statusTone(status?: string | null) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "approved" || normalized === "published") return "bg-emerald-100 text-emerald-700";
  if (normalized === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function EventTable({ events, onEdit, onDelete, onView }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Event Name</th>
            <th className="px-4 py-3 font-medium">Event Date</th>
            <th className="px-4 py-3 font-medium">Approval Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((event) => (
            <tr key={event.eventId} className="text-slate-800">
              <td className="px-4 py-4 font-medium">{event.eventName}</td>
              <td className="px-4 py-4">{formatDate(event.eventDate)}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(event.workflowStatus ?? event.approvedStatus)}`}>
                  {event.workflowStatus ?? event.approvedStatus ?? "pending"}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {onView ? <button onClick={() => onView(event)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50">View</button> : null}
                  {onEdit ? <button onClick={() => onEdit(event)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Edit</button> : null}
                  {onDelete ? <button onClick={() => onDelete(event)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Delete</button> : null}
                </div>
              </td>
            </tr>
          ))}
          {!events.length ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No events found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}