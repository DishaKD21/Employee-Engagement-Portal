"use client";

import Link from "next/link";
import React from "react";
import type { SurveyRecord } from "../services/survey.service";
import { EnterpriseBadge, EnterpriseButton, EnterpriseCard } from "@/components/ui/enterprise";

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
    <EnterpriseCard className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{survey.title}</h3>
          <p className="mt-2 text-sm text-slate-600">Target audience: {survey.targetAudience}</p>
        </div>
        <EnterpriseBadge tone={isSubmitted ? "success" : "warning"}>
          {survey.workflowStatus ?? survey.approvedStatus ?? "pending"}
        </EnterpriseBadge>
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
        className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ${isSubmitted ? "cursor-not-allowed bg-slate-300 text-slate-500" : "bg-blue-700 text-white hover:bg-blue-800"}`}
      >
        {isSubmitted ? "Submitted" : "Start Survey"}
      </Link>
    </EnterpriseCard>
  );
}
