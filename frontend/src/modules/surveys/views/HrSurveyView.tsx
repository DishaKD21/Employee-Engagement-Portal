"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import SurveyForm from "../components/SurveyForm";
import SurveyTable from "../components/SurveyTable";
import { createSurvey, deleteSurvey, getMySurveys, updateSurvey, type SurveyFormValues, type SurveyRecord } from "../services/survey.service";

function toFormValues(survey?: SurveyRecord | null): Partial<SurveyFormValues> | undefined {
  if (!survey) return undefined;

  return {
    title: survey.title ?? "",
    target_audience: survey.targetAudience ?? "",
    open_date: survey.openDate?.slice(0, 10) ?? "",
    close_date: survey.closeDate?.slice(0, 10) ?? "",
    is_anonymous: survey.isAnonymous ?? true,
    questions: (survey.questions ?? []).map((question) => ({
      question_text: question.questionText ?? "",
      question_type: (question.questionType ?? "TEXT") as SurveyFormValues["questions"][number]["question_type"],
      options: question.options ?? [],
    })),
  };
}

export default function HrSurveyView() {
  const token = useAuthStore((state) => state.token);
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyRecord | null>(null);
  const [editingSurvey, setEditingSurvey] = useState<SurveyRecord | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues = useMemo(() => toFormValues(editingSurvey), [editingSurvey]);

  async function loadSurveys() {
    if (!token) return;

    setLoading(true);
    setErrorMessage("");

    try {
      setSurveys(await getMySurveys(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load surveys"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSurveys(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: SurveyFormValues) => {
    if (!token) return;

    try {
      if (editingSurvey) {
        await updateSurvey(editingSurvey.surveyId, values, token);
        setMessage("Survey updated and resubmitted for approval.");
      } else {
        await createSurvey(values, token);
        setMessage("Survey submitted for approval.");
      }

      setEditingSurvey(null);
      setFormVisible(false);
      await loadSurveys();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to save survey"));
    }
  };

  const handleDelete = async (survey: SurveyRecord) => {
    if (!token) return;
    if (!window.confirm(`Delete ${survey.title}?`)) return;

    try {
      await deleteSurvey(survey.surveyId, token);
      setMessage("Survey deleted.");
      await loadSurveys();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete survey"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">HR Surveys</h1>
            <p className="mt-2 text-slate-600">Create surveys and submit them for HR Manager approval.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingSurvey(null);
              setFormVisible((current) => !current);
            }}
            className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Create Survey
          </button>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        {formVisible ? (
          <SurveyForm
            key={editingSurvey?.surveyId ?? "create-survey"}
            title={editingSurvey ? "Edit Survey" : "Create Survey"}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingSurvey(null);
              setFormVisible(false);
            }}
            submitLabel="Submit For Approval"
          />
        ) : null}

        {selectedSurvey ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{selectedSurvey.title}</h2>
            <p className="mt-2 text-sm text-slate-600">Target audience: {selectedSurvey.targetAudience}</p>
            <p className="mt-2 text-sm text-slate-500">Questions: {(selectedSurvey.questions ?? []).length}</p>
          </div>
        ) : null}

        {loading ? <p className="text-sm text-slate-500">Loading surveys...</p> : null}

        <SurveyTable
          surveys={surveys}
          onEdit={(survey) => {
            setEditingSurvey(survey);
            setFormVisible(true);
          }}
          onDelete={handleDelete}
          onView={(survey) => setSelectedSurvey(survey)}
        />
      </div>
    </div>
  );
}
