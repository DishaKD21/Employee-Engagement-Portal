"use client";

import React from "react";
import type { SurveyQuestionRecord, SurveyRecord } from "../services/survey.service";

type SurveyAnswerValue = string | string[];

type Props = {
  survey: SurveyRecord;
  values: Record<number, SurveyAnswerValue>;
  onChange: (questionId: number, value: SurveyAnswerValue) => void;
};

function renderOptions(question: SurveyQuestionRecord) {
  return question.options ?? [];
}

export default function DynamicSurveyRenderer({ survey, values, onChange }: Props) {
  return (
    <div className="space-y-4">
      {(survey.questions ?? []).map((question, index) => {
        const questionType = question.questionType ?? "TEXT";
        const options = renderOptions(question);
        const currentValue = values[question.questionId] ?? (questionType === "CHECKBOX" ? [] : "");

        return (
          <div key={question.questionId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{index + 1}. {question.questionText}</h3>
              <p className="text-xs uppercase tracking-wide text-slate-500">{questionType}</p>
            </div>

            {questionType === "TEXT" ? (
              <input
                value={typeof currentValue === "string" ? currentValue : ""}
                onChange={(event) => onChange(question.questionId, event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Your answer"
              />
            ) : null}

            {questionType === "TEXTAREA" ? (
              <textarea
                value={typeof currentValue === "string" ? currentValue : ""}
                onChange={(event) => onChange(question.questionId, event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
                placeholder="Your answer"
              />
            ) : null}

            {questionType === "RADIO" ? (
              <div className="space-y-2">
                {options.map((option) => (
                  <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      checked={currentValue === option}
                      onChange={() => onChange(question.questionId, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : null}

            {questionType === "CHECKBOX" ? (
              <div className="space-y-2">
                {options.map((option) => {
                  const selectedValues = Array.isArray(currentValue) ? currentValue : [];
                  const checked = selectedValues.includes(option);

                  return (
                    <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const nextValues = checked
                            ? selectedValues.filter((entry) => entry !== option)
                            : [...selectedValues, option];
                          onChange(question.questionId, nextValues);
                        }}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            ) : null}

            {questionType === "DROPDOWN" ? (
              <select
                value={typeof currentValue === "string" ? currentValue : ""}
                onChange={(event) => onChange(question.questionId, event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="">Select an option</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : null}

          </div>
        );
      })}
    </div>
  );
}
