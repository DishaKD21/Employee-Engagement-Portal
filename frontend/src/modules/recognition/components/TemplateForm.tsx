"use client";

import React, { useEffect, useState } from "react";
import type { RecognitionTemplateFormValues } from "../services/recognition.service";

type Props = {
  initialValues?: Partial<RecognitionTemplateFormValues>;
  onSubmit: (values: RecognitionTemplateFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  title?: string;
  isSubmitting?: boolean;
};

const defaultValues: RecognitionTemplateFormValues = {
  template_name: "",
  event_type: "BIRTHDAY",
  content: "",
};

function toFormValues(values?: Partial<RecognitionTemplateFormValues>) {
  return {
    ...defaultValues,
    ...values,
  };
}

export default function TemplateForm({ initialValues, onSubmit, onCancel, submitLabel = "Submit For Approval", title, isSubmitting }: Props) {
  const [values, setValues] = useState<RecognitionTemplateFormValues>(toFormValues(initialValues));

  useEffect(() => {
    setValues(toFormValues(initialValues));
  }, [initialValues]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value } as RecognitionTemplateFormValues));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit({
      ...values,
      template_name: values.template_name.trim(),
      content: values.content.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title ?? "Recognition Template"}</h2>
          <p className="text-sm text-slate-500">Create a recognition template and submit it for HR Manager approval.</p>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="template_name"
          value={values.template_name}
          onChange={handleChange}
          placeholder="Template name"
          required
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
        />
        <select name="event_type" value={values.event_type} onChange={handleChange} required className="rounded-lg border border-slate-300 px-4 py-3 text-sm">
          <option value="BIRTHDAY">Birthday</option>
          <option value="WORK_ANNIVERSARY">Work Anniversary</option>
        </select>
      </div>

      <textarea
        name="content"
        value={values.content}
        onChange={handleChange}
        placeholder="Template content with placeholders like {{employee_name}} and {{years}}"
        rows={6}
        required
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
      />

      <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}