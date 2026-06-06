"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@mantine/core";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import SurveyCard from "../components/SurveyCard";
import { getMySubmissions, getPublishedSurveys, type SurveyRecord, type SurveySubmissionRecord } from "../services/survey.service";
import { DataViewport, EmptyState, PaginationBar } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

export default function EmployeeSurveyListView() {
  const token = useAuthStore((state) => state.token);
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [submissions, setSubmissions] = useState<SurveySubmissionRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadSurveys() {
    if (!token) return;

    try {
      const [publishedSurveys, mySubmissions] = await Promise.all([
        getPublishedSurveys(token),
        getMySubmissions(token),
      ]);
      setSurveys(publishedSurveys);
      setSubmissions(mySubmissions);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load surveys"));
    }
  }

  useEffect(() => {
    void loadSurveys(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const submittedIds = useMemo(
    () => new Set(submissions.map((submission) => submission.surveyId).filter((value): value is number => value !== null)),
    [submissions],
  );
  const surveyPagination = useClientPagination(surveys);
  const submissionPagination = useClientPagination(submissions);
  const surveySelection = useRowSelection(surveyPagination.paginatedItems.map((survey) => survey.surveyId), surveys.map((survey) => survey.surveyId));
  const submissionSelection = useRowSelection(submissionPagination.paginatedItems.map((submission) => submission.responseId), submissions.map((submission) => submission.responseId));

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Surveys</h1>
          <p className="mt-2 text-slate-600">Browse approved surveys and submit your responses.</p>
        </div>

        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Survey List</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Checkbox checked={surveySelection.allVisibleSelected} indeterminate={surveySelection.someVisibleSelected} onChange={surveySelection.toggleVisible} label="Select all" />
            <span>{surveySelection.selectedCount} items selected</span>
            {surveySelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={surveySelection.clearSelection}>Deselect all</button> : null}
          </div>
          <DataViewport height={620}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {surveyPagination.paginatedItems.map((survey) => (
              <div key={survey.surveyId} className="relative">
                <Checkbox className="absolute left-3 top-3 z-[1] rounded bg-white p-1 shadow-sm" checked={surveySelection.selectedSet.has(survey.surveyId)} onChange={() => surveySelection.toggleOne(survey.surveyId)} aria-label={`Select ${survey.title ?? "survey"}`} />
              <SurveyCard key={survey.surveyId} survey={survey} isSubmitted={submittedIds.has(survey.surveyId)} />
              </div>
            ))}
            {!surveys.length ? <div className="md:col-span-2 xl:col-span-3"><EmptyState title="No surveys available." description="Published surveys will appear here." /></div> : null}
          </div>
          </DataViewport>
          <PaginationBar {...surveyPagination} onChange={surveyPagination.setPage} onPageSizeChange={surveyPagination.setPageSize} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Survey Participation History</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Checkbox checked={submissionSelection.allVisibleSelected} indeterminate={submissionSelection.someVisibleSelected} onChange={submissionSelection.toggleVisible} label="Select all" />
            <span>{submissionSelection.selectedCount} items selected</span>
            {submissionSelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={submissionSelection.clearSelection}>Deselect all</button> : null}
          </div>
          <DataViewport height={500} className="mt-4">
          <div className="space-y-3 pr-3 text-sm text-slate-600">
            {submissionPagination.paginatedItems.map((submission) => (
              <div key={submission.responseId} className="rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-start gap-3">
                <Checkbox checked={submissionSelection.selectedSet.has(submission.responseId)} onChange={() => submissionSelection.toggleOne(submission.responseId)} aria-label={`Select response ${submission.responseId}`} />
                <div>
                <p className="font-medium text-slate-900">{submission.survey?.title ?? `Survey #${submission.surveyId ?? "-"}`}</p>
                <p>Submitted: {submission.submittedAt?.slice(0, 10) ?? "-"}</p>
                </div>
                </div>
              </div>
            ))}
            {!submissions.length ? <EmptyState title="No survey responses available." description="Your submitted survey responses will appear here." /> : null}
          </div>
          </DataViewport>
          <div className="mt-4">
            <PaginationBar {...submissionPagination} onChange={submissionPagination.setPage} onPageSizeChange={submissionPagination.setPageSize} />
          </div>
        </div>
      </div>
    </div>
  );
}
