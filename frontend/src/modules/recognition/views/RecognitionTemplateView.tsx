"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/modules/auth/services/auth.helpers";
import TemplateForm from "../components/TemplateForm";
import RecognitionCard from "../components/RecognitionCard";
import RecognitionHistoryView from "./RecognitionHistoryView";
import {
  createRecognitionTemplate,
  deleteRecognitionTemplate,
  getRecognitionTemplates,
  updateRecognitionTemplate,
  type RecognitionTemplateFormValues,
  type RecognitionTemplateRecord,
} from "../services/recognition.service";

function toFormValues(template: RecognitionTemplateRecord | null): Partial<RecognitionTemplateFormValues> {
  if (!template) return {};

  return {
    template_name: template.templateName ?? "",
    event_type: template.eventType ?? "BIRTHDAY",
    content: template.content ?? "",
  };
}

export default function RecognitionTemplateView() {
  const token = useAuthStore((state) => state.token);
  const [templates, setTemplates] = useState<RecognitionTemplateRecord[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<RecognitionTemplateRecord | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplateValues = useMemo(() => toFormValues(selectedTemplate), [selectedTemplate]);

  async function loadTemplates() {
    if (!token) return;

    try {
      setTemplates(await getRecognitionTemplates(token));
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load recognition templates"));
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, [token]);

  const handleSubmit = async (values: RecognitionTemplateFormValues) => {
    if (!token) return;

    setIsSubmitting(true);
    setErrorMessage("");

    console.log("[recognition-template:create] submit payload", values);

    try {
      if (selectedTemplate) {
        const response = await updateRecognitionTemplate(selectedTemplate.templateId, values, token);
        console.log("[recognition-template:create] api response", response);
        setMessage("Template updated and resubmitted for approval.");
      } else {
        const response = await createRecognitionTemplate(values, token);
        console.log("[recognition-template:create] api response", response);
        setMessage("Template submitted for approval.");
      }

      setSelectedTemplate(null);
      await loadTemplates();
    } catch (error) {
      console.error("[recognition-template:create] api error", error);
      setErrorMessage(getErrorMessage(error, "Failed to save template"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!token) return;

    try {
      await deleteRecognitionTemplate(templateId, token);
      setMessage("Template deleted.");
      if (selectedTemplate?.templateId === templateId) {
        setSelectedTemplate(null);
      }
      await loadTemplates();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete template"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recognition Templates</h1>
          <p className="mt-2 text-slate-600">Build birthday and work-anniversary templates, then route them through approval.</p>
        </div>

        {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TemplateForm
            key={selectedTemplate?.templateId ?? "new"}
            title={selectedTemplate ? "Edit Recognition Template" : "Create Recognition Template"}
            initialValues={selectedTemplateValues}
            onSubmit={handleSubmit}
            onCancel={selectedTemplate ? () => setSelectedTemplate(null) : undefined}
            submitLabel={selectedTemplate ? "Update Draft" : "Submit For Approval"}
            isSubmitting={isSubmitting}
          />

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Template Library</h2>
              <p className="mt-2 text-sm text-slate-600">Approved templates are used by the scheduler. Pending templates can still be edited.</p>
            </div>

            <div className="space-y-3">
              {templates.map((template) => (
                <RecognitionCard
                  key={template.templateId}
                  title={template.templateName ?? "Untitled Template"}
                  subtitle={`${template.eventType ?? "Recognition"} • v${template.version ?? 1}`}
                  description={template.content}
                  badge={template.isActive ? "ACTIVE" : template.approvedStatus ?? "PENDING"}
                  footer={
                    <div className="flex flex-wrap gap-2">
                      {template.approvedStatus === "pending" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate(template)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      ) : null}
                      {template.approvedStatus === "pending" ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(template.templateId)}
                          className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  }
                />
              ))}

              {!templates.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No templates found.</div> : null}
            </div>
          </div>
        </div>

        <RecognitionHistoryView />
      </div>
    </div>
  );
}