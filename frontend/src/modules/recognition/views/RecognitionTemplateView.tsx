"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox, Modal } from "@mantine/core";
import { Trash2 } from "lucide-react";
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
import { DataViewport, EmptyState, EnterpriseButton, EnterpriseCard, PaginationBar, SectionHeader } from "@/components/ui/enterprise";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useRowSelection } from "@/hooks/useRowSelection";

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
  const templatePagination = useClientPagination(templates);
  const templateSelection = useRowSelection(templatePagination.paginatedItems.map((template) => template.templateId), templates.map((template) => template.templateId));
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    void loadTemplates(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]);

  const handleSubmit = async (values: RecognitionTemplateFormValues) => {
    if (!token) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (selectedTemplate) {
        await updateRecognitionTemplate(selectedTemplate.templateId, values, token);
        setMessage("Template updated and resubmitted for approval.");
      } else {
        await createRecognitionTemplate(values, token);
        setMessage("Template submitted for approval.");
      }

      setSelectedTemplate(null);
      await loadTemplates();
    } catch (error) {
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

  const handleBulkDelete = async () => {
    for (const templateId of templateSelection.selectedIds) {
      await handleDelete(templateId);
    }

    templateSelection.clearSelection();
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Recognition" title="Recognition templates" description="Build birthday and work-anniversary templates, then route them through approval." />

      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <EnterpriseCard className="p-5">
          <TemplateForm
            key={selectedTemplate?.templateId ?? "new"}
            title={selectedTemplate ? "Edit Recognition Template" : "Create Recognition Template"}
            initialValues={selectedTemplateValues}
            onSubmit={handleSubmit}
            onCancel={selectedTemplate ? () => setSelectedTemplate(null) : undefined}
            submitLabel={selectedTemplate ? "Update Draft" : "Submit For Approval"}
            isSubmitting={isSubmitting}
          />
        </EnterpriseCard>

        <div className="space-y-4">
          <EnterpriseCard className="p-5">
            <h2 className="text-xl font-semibold text-slate-900">Template Library</h2>
            <p className="mt-2 text-sm text-slate-600">Approved templates are used by the scheduler. Pending templates can still be edited.</p>
          </EnterpriseCard>

          <Modal opened={confirmOpen} onClose={() => setConfirmOpen(false)} title={`Delete ${templateSelection.selectedCount} selected records?`} centered>
            <p className="text-sm text-slate-600">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <EnterpriseButton variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</EnterpriseButton>
              <EnterpriseButton variant="danger" onClick={() => void handleBulkDelete()}>Delete</EnterpriseButton>
            </div>
          </Modal>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Checkbox checked={templateSelection.allVisibleSelected} indeterminate={templateSelection.someVisibleSelected} onChange={templateSelection.toggleVisible} label="Select all" />
              <span>{templateSelection.selectedCount} items selected</span>
              {templateSelection.selectedCount ? <button type="button" className="font-semibold text-blue-700" onClick={templateSelection.clearSelection}>Deselect all</button> : null}
            </div>
            <EnterpriseButton variant="danger" disabled={!templateSelection.selectedCount} onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </EnterpriseButton>
          </div>

          <DataViewport height={620}>
          <div className="space-y-3">
            {templatePagination.paginatedItems.map((template) => (
              <div key={template.templateId} className="relative">
                <Checkbox className="absolute left-3 top-3 z-[1] rounded bg-white p-1 shadow-sm" checked={templateSelection.selectedSet.has(template.templateId)} onChange={() => templateSelection.toggleOne(template.templateId)} aria-label={`Select ${template.templateName ?? "template"}`} />
              <RecognitionCard
                title={template.templateName ?? "Untitled Template"}
                subtitle={`${template.eventType ?? "Recognition"} • v${template.version ?? 1}`}
                description={template.content}
                badge={template.isActive ? "ACTIVE" : template.approvedStatus ?? "PENDING"}
                footer={
                  <div className="flex flex-wrap gap-2">
                    {template.approvedStatus === "pending" ? <EnterpriseButton type="button" variant="secondary" onClick={() => setSelectedTemplate(template)}>Edit</EnterpriseButton> : null}
                    {template.approvedStatus === "pending" ? <EnterpriseButton type="button" variant="danger" onClick={() => void handleDelete(template.templateId)}>Delete</EnterpriseButton> : null}
                  </div>
                }
              />
              </div>
            ))}

            {!templates.length ? <EmptyState title="No templates found." description="Recognition templates will appear here after they are created." /> : null}
          </div>
          </DataViewport>
          <PaginationBar {...templatePagination} onChange={templatePagination.setPage} onPageSizeChange={templatePagination.setPageSize} />
        </div>
      </div>

      <EnterpriseCard className="p-5">
        <RecognitionHistoryView />
      </EnterpriseCard>
    </div>
  );
}
