"use client";

import React, { useState } from "react";
import SurveyQuestionBuilder from "./SurveyQuestionBuilder";
import type { SurveyFormValues } from "../services/survey.service";

type Props = {
  initialValues?: Partial<SurveyFormValues>;
  onSubmit: (values: SurveyFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  title?: string;
  isSubmitting?: boolean;
};

const defaultValues: SurveyFormValues = {
  title: "",
  target_audience: "",
  open_date: "",
  close_date: "",
  is_anonymous: true,
  questions: [
    {
      question_text: "",
      question_type: "TEXT",
      options: [],
    },
  ],
};

function toFormValues(values?: Partial<SurveyFormValues>) {
  return {
    ...defaultValues,
    ...values,
    questions: values?.questions?.length
      ? values.questions.map((question) => ({
          question_text: question.question_text,
          question_type: question.question_type,
          options: [...question.options],
        }))
      : defaultValues.questions,
  };
}

export default function SurveyForm({ initialValues, onSubmit, onCancel, submitLabel = "Submit For Approval", title, isSubmitting }: Props) {
  const [values, setValues] = useState<SurveyFormValues>(toFormValues(initialValues));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit({
      ...values,
      questions: values.questions.map((question) => ({
        ...question,
        question_text: question.question_text.trim(),
        options: question.options.map((option) => option.trim()).filter(Boolean),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title ?? "Survey Form"}</h2>
          <p className="text-sm text-slate-500">Create a survey and submit it for HR Manager approval.</p>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          placeholder="Survey title"
          required
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
        />
        <input
          value={values.target_audience}
          onChange={(event) => setValues((current) => ({ ...current, target_audience: event.target.value }))}
          placeholder="Target audience"
          required
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
        />
        <input
          type="date"
          value={values.open_date}
          onChange={(event) => setValues((current) => ({ ...current, open_date: event.target.value }))}
          required
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
        />
        <input
          type="date"
          value={values.close_date}
          onChange={(event) => setValues((current) => ({ ...current, close_date: event.target.value }))}
          required
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={values.is_anonymous}
          onChange={(event) => setValues((current) => ({ ...current, is_anonymous: event.target.checked }))}
          className="h-4 w-4 rounded border-slate-300"
        />
        Anonymous responses
      </label>

      <SurveyQuestionBuilder
        questions={values.questions}
        onChange={(questions) => setValues((current) => ({ ...current, questions }))}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
