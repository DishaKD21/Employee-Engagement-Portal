"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import SurveyCard from "../components/SurveyCard";
import { getMySubmissions, getPublishedSurveys, type SurveyRecord, type SurveySubmissionRecord } from "../services/survey.service";

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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employee Surveys</h1>
          <p className="mt-2 text-slate-600">Browse approved surveys and submit your responses.</p>
        </div>

        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {surveys.map((survey) => (
            <SurveyCard key={survey.surveyId} survey={survey} isSubmitted={submittedIds.has(survey.surveyId)} />
          ))}
        </div>
      </div>
    </div>
  );
}
