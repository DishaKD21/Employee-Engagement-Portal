"use client";

import Link from "next/link";
import React from "react";
import type { SurveyRecord } from "../services/survey.service";

type Props = {
  survey: SurveyRecord;
  isSubmitted?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function SurveyCard({ survey, isSubmitted }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{survey.title}</h3>
          <p className="mt-2 text-sm text-slate-600">Target audience: {survey.targetAudience}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {survey.workflowStatus ?? survey.approvedStatus ?? "pending"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p><span className="font-medium text-slate-900">Close date:</span> {formatDate(survey.closeDate)}</p>
      </div>

      <Link
        href={`/employee/surveys/${survey.surveyId}`}
        onClick={(event) => {
          if (isSubmitted) {
            event.preventDefault();
          }
        }}
        aria-disabled={isSubmitted}
        className={`mt-5 inline-flex rounded-lg px-4 py-3 text-sm font-semibold text-white ${isSubmitted ? "cursor-not-allowed bg-slate-400" : "bg-slate-900 hover:bg-slate-700"}`}
      >
        {isSubmitted ? "Submitted" : "Start Survey"}
      </Link>
    </article>
  );
}
