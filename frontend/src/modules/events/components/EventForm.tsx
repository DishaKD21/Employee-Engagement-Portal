"use client";

import React, { useState } from "react";
import type { EventFormValues } from "../services/event.service";
import { EnterpriseButton, EnterpriseHelperText, EnterpriseInput, EnterpriseLabel, EnterpriseTextarea } from "@/components/ui/enterprise";

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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title ?? "Event Form"}</h2>
          <EnterpriseHelperText>Submit the event for HR Manager approval.</EnterpriseHelperText>
        </div>
        {onCancel ? (
          <EnterpriseButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </EnterpriseButton>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <EnterpriseLabel>Event name</EnterpriseLabel>
          <EnterpriseInput name="event_name" value={values.event_name} onChange={handleChange} placeholder="Event name" required />
        </div>
        <div className="space-y-2">
          <EnterpriseLabel>Event type</EnterpriseLabel>
          <EnterpriseInput name="event_type" value={values.event_type} onChange={handleChange} placeholder="Event type" required />
        </div>
        <div className="space-y-2 md:col-span-2">
          <EnterpriseLabel>Target audience</EnterpriseLabel>
          <EnterpriseInput name="target_audience" value={values.target_audience} onChange={handleChange} placeholder="Target audience" required />
        </div>
        <div className="space-y-2">
          <EnterpriseLabel>Registration start</EnterpriseLabel>
          <EnterpriseInput name="registration_start" type="date" value={values.registration_start} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <EnterpriseLabel>Registration end</EnterpriseLabel>
          <EnterpriseInput name="registration_end" type="date" value={values.registration_end} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <EnterpriseLabel>Event date</EnterpriseLabel>
          <EnterpriseInput name="event_date" type="date" value={values.event_date} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <EnterpriseLabel>Description</EnterpriseLabel>
        <EnterpriseTextarea name="description" value={values.description} onChange={handleChange} placeholder="Description" rows={4} />
      </div>

      <EnterpriseButton type="submit" disabled={isSubmitting} variant="primary">
        {isSubmitting ? "Submitting..." : submitLabel}
      </EnterpriseButton>
    </form>
  );
}