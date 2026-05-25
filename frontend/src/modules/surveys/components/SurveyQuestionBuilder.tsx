"use client";

import React from "react";
import { surveyQuestionTypes, type SurveyQuestionFormValue, type SurveyQuestionType } from "../services/survey.service";

type Props = {
  questions: SurveyQuestionFormValue[];
  onChange: (questions: SurveyQuestionFormValue[]) => void;
};

const defaultQuestion: SurveyQuestionFormValue = {
  question_text: "",
  question_type: "TEXT",
  options: [],
};

function cloneQuestions(questions: SurveyQuestionFormValue[]) {
  return questions.map((question) => ({
    ...question,
    options: [...question.options],
  }));
}

function needsOptions(questionType: SurveyQuestionType) {
  return ["RADIO", "CHECKBOX", "DROPDOWN"].includes(questionType);
}

export default function SurveyQuestionBuilder({ questions, onChange }: Props) {
  const updateQuestion = (index: number, updater: (question: SurveyQuestionFormValue) => SurveyQuestionFormValue) => {
    const next = cloneQuestions(questions);
    next[index] = updater(next[index]);
    onChange(next);
  };

  const addQuestion = () => {
    onChange([...cloneQuestions(questions), { ...defaultQuestion }]);
  };

  const removeQuestion = (index: number) => {
    const next = cloneQuestions(questions);
    next.splice(index, 1);
    onChange(next.length ? next : [{ ...defaultQuestion }]);
  };

  const addOption = (questionIndex: number) => {
    updateQuestion(questionIndex, (question) => ({
      ...question,
      options: [...question.options, ""],
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    updateQuestion(questionIndex, (question) => {
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    updateQuestion(questionIndex, (question) => {
      const options = [...question.options];
      options.splice(optionIndex, 1);
      return { ...question, options };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Question Builder</h3>
          <p className="text-sm text-slate-500">Add, remove, and configure survey questions dynamically.</p>
        </div>
        <button type="button" onClick={addQuestion} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Add Question
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Question {index + 1}</h4>
              <button type="button" onClick={() => removeQuestion(index)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                Remove
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={question.question_text}
                onChange={(event) => updateQuestion(index, (current) => ({ ...current, question_text: event.target.value }))}
                placeholder="Question text"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              />

              <select
                value={question.question_type}
                onChange={(event) => updateQuestion(index, (current) => ({ ...current, question_type: event.target.value as SurveyQuestionType, options: needsOptions(event.target.value as SurveyQuestionType) ? current.options : [] }))}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              >
                {surveyQuestionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {needsOptions(question.question_type) ? (
              <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-700">Options</span>
                  <button type="button" onClick={() => addOption(index)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Add Option
                  </button>
                </div>

                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <input
                        value={option}
                        onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm"
                      />
                      <button type="button" onClick={() => removeOption(index, optionIndex)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
