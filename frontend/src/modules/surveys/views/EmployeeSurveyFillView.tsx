"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import DynamicSurveyRenderer from "../components/DynamicSurveyRenderer";
import { getMySubmissions, getSurveyById, submitSurvey, type SurveyRecord } from "../services/survey.service";

type Props = {
  surveyId: number;
};

export default function EmployeeSurveyFillView({ surveyId }: Props) {
  const token = useAuthStore((state) => state.token);
  const [survey, setSurvey] = useState<SurveyRecord | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<number, string | string[]>>({});
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSurvey() {
    if (!token) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const [surveyData, mySubmissions] = await Promise.all([
        getSurveyById(surveyId, token),
        getMySubmissions(token),
      ]);

      setSurvey(surveyData);
      setSubmitted(mySubmissions.some((submission) => submission.surveyId === surveyId));

      const initialValues = Object.fromEntries(
        (surveyData.questions ?? []).map((question) => [
          question.questionId,
          question.questionType === "CHECKBOX" ? [] : "",
        ]),
      );

      setValues(initialValues as Record<number, string | string[]>);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load survey"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSurvey(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [surveyId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const questionCount = useMemo(() => survey?.questions?.length ?? 0, [survey]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !survey) return;

    try {
      const payload = {
        answers: (survey.questions ?? []).map((question) => {
          const value = values[question.questionId];

          if (Array.isArray(value)) {
            return {
              question_id: question.questionId,
              answer_text: value.join(", "),
            };
          }

          return {
            question_id: question.questionId,
            answer_text: String(value ?? "").trim(),
          };
        }),
      };

      if (payload.answers.some((answer) => !answer.answer_text)) {
        throw new Error("Please answer every question before submitting.");
      }

      await submitSurvey(survey.surveyId, payload, token);
      setMessage("Survey submitted successfully.");
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to submit survey"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {loading ? <p className="text-sm text-slate-500">Loading survey...</p> : null}

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        {survey ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h1 className="text-3xl font-bold text-slate-900">{survey.title}</h1>
              <p className="text-sm text-slate-600">Target audience: {survey.targetAudience}</p>
              <p className="text-sm text-slate-500">Questions: {questionCount}</p>
            </div>

            <DynamicSurveyRenderer
              survey={survey}
              values={values}
              onChange={(questionId, value) => setValues((current) => ({ ...current, [questionId]: value }))}
            />

            <button
              type="submit"
              disabled={submitted}
              className="inline-flex rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitted ? "Already Submitted" : "Submit Survey"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
