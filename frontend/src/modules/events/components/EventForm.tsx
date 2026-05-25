"use client";

import React, { useState } from "react";
import type { EventFormValues } from "../services/event.service";

type Props = {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  title?: string;
  isSubmitting?: boolean;
};

const defaultValues: EventFormValues = {
  event_name: "",
  event_type: "",
  description: "",
  target_audience: "",
  registration_start: "",
  registration_end: "",
  event_date: "",
};

function toFormValues(values?: Partial<EventFormValues>) {
  return {
    ...defaultValues,
    ...values,
  };
}

export default function EventForm({ initialValues, onSubmit, onCancel, submitLabel = "Submit For Approval", title, isSubmitting }: Props) {
  const [values, setValues] = useState<EventFormValues>(toFormValues(initialValues));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit({
      ...values,
      description: values.description?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title ?? "Event Form"}</h2>
          <p className="text-sm text-slate-500">Submit the event for HR Manager approval.</p>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input name="event_name" value={values.event_name} onChange={handleChange} placeholder="Event name" required className="rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        <input name="event_type" value={values.event_type} onChange={handleChange} placeholder="Event type" required className="rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        <input name="target_audience" value={values.target_audience} onChange={handleChange} placeholder="Target audience" required className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2" />
        <input name="registration_start" type="date" value={values.registration_start} onChange={handleChange} required className="rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        <input name="registration_end" type="date" value={values.registration_end} onChange={handleChange} required className="rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        <input name="event_date" type="date" value={values.event_date} onChange={handleChange} required className="rounded-lg border border-slate-300 px-4 py-3 text-sm" />
      </div>

      <textarea name="description" value={values.description} onChange={handleChange} placeholder="Description" rows={4} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" />

      <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}