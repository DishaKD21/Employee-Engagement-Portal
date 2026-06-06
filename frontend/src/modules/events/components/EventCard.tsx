"use client";

import React from "react";
import type { EventRecord } from "../services/event.service";
import { EnterpriseBadge, EnterpriseButton, EnterpriseCard } from "@/components/ui/enterprise";

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
    <EnterpriseCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{event.eventName}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{event.description || "No description provided."}</p>
        </div>
        <EnterpriseBadge tone="info">
          {event.eventType}
        </EnterpriseBadge>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p><span className="font-medium text-slate-900">Event date:</span> {formatDate(event.eventDate)}</p>
        <p><span className="font-medium text-slate-900">Target audience:</span> {event.targetAudience}</p>
      </div>

      <EnterpriseButton
        type="button"
        onClick={() => onRegister?.(event)}
        disabled={!onRegister || isRegistered}
        className="mt-5 w-full"
        variant="primary"
      >
        {isRegistered ? "Registered" : "Register"}
      </EnterpriseButton>
    </EnterpriseCard>
  );
}