"use client";

import React from "react";
import type { SurveyRecord } from "../services/survey.service";

type Props = {
  surveys: SurveyRecord[];
  onEdit?: (survey: SurveyRecord) => void;
  onDelete?: (survey: SurveyRecord) => void;
  onView?: (survey: SurveyRecord) => void;
};

function statusTone(status?: string | null) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "approved") return "bg-emerald-100 text-emerald-700";
  if (normalized === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function SurveyTable({ surveys, onEdit, onDelete, onView }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Survey Title</th>
            <th className="px-4 py-3 font-medium">Open Date</th>
            <th className="px-4 py-3 font-medium">Close Date</th>
            <th className="px-4 py-3 font-medium">Approval Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {surveys.map((survey) => (
            <tr key={survey.surveyId} className="text-slate-800">
              <td className="px-4 py-4 font-medium">{survey.title}</td>
              <td className="px-4 py-4">{formatDate(survey.openDate)}</td>
              <td className="px-4 py-4">{formatDate(survey.closeDate)}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(survey.workflowStatus ?? survey.approvedStatus)}`}>
                  {survey.workflowStatus ?? survey.approvedStatus ?? "pending"}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {onView ? <button type="button" onClick={() => onView(survey)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50">View</button> : null}
                  {onEdit ? <button type="button" onClick={() => onEdit(survey)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Edit</button> : null}
                  {onDelete ? <button type="button" onClick={() => onDelete(survey)} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Delete</button> : null}
                </div>
              </td>
            </tr>
          ))}
          {!surveys.length ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No surveys found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
