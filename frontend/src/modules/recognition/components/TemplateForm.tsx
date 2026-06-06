"use client";

import React, { useEffect, useState } from "react";
import type { RecognitionTemplateFormValues } from "../services/recognition.service";
import { EnterpriseButton, EnterpriseHelperText, EnterpriseInput, EnterpriseLabel, EnterpriseSelect, EnterpriseTextarea } from "@/components/ui/enterprise";

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
    setValues(toFormValues(initialValues)); // eslint-disable-line react-hooks/set-state-in-effect
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title ?? "Recognition Template"}</h2>
          <EnterpriseHelperText>Create a recognition template and submit it for HR Manager approval.</EnterpriseHelperText>
        </div>
        {onCancel ? (
          <EnterpriseButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </EnterpriseButton>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <EnterpriseLabel>Template name</EnterpriseLabel>
          <EnterpriseInput name="template_name" value={values.template_name} onChange={handleChange} placeholder="Template name" required />
        </div>
        <div className="space-y-2">
          <EnterpriseLabel>Event type</EnterpriseLabel>
          <EnterpriseSelect name="event_type" value={values.event_type} onChange={handleChange} required>
            <option value="BIRTHDAY">Birthday</option>
            <option value="WORK_ANNIVERSARY">Work Anniversary</option>
          </EnterpriseSelect>
        </div>
      </div>

      <div className="space-y-2">
        <EnterpriseLabel>Template content</EnterpriseLabel>
        <EnterpriseTextarea
        name="content"
        value={values.content}
        onChange={handleChange}
        placeholder="Template content with placeholders like {{employee_name}} and {{years}}"
        rows={6}
        required
        />
      </div>

      <EnterpriseButton type="submit" disabled={isSubmitting} variant="primary">
        {isSubmitting ? "Submitting..." : submitLabel}
      </EnterpriseButton>
    </form>
  );
}
