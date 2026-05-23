"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import SectionHeader from "@/modules/employee/components/SectionHeader";
import { useEmployeeSurveysData } from "@/modules/employee/hooks/useEmployeeData";
import { formatDate } from "@/utils/format";

export default function EmployeeSurveysView() {
  const { data, loading, error } = useEmployeeSurveysData();

  if (loading) return <Loader label="Loading surveys" />;
  if (error) return <EmptyState title="Unable to load surveys" description={error} />;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Employee surveys" title="Surveys assigned to you" description="Pulled directly from GET /api/v1/employees/surveys." />

      <div className="grid gap-4 xl:grid-cols-2">
        {(data || []).map((survey) => (
          <Card
            key={survey.surveyId}
            title={survey.title || "Survey"}
            subtitle={`Created ${formatDate(survey.createdAt)}`}
            action={<Badge tone={survey.responses?.length ? "success" : "warning"}>{survey.responses?.length ? "Submitted" : "Pending"}</Badge>}
          >
            <div className="space-y-3 text-sm text-slate-300">
              <p><span className="text-slate-500">Target audience:</span> {survey.targetAudience || "All employees"}</p>
              <p><span className="text-slate-500">Questions:</span> {survey.questions?.length || 0}</p>
              <p><span className="text-slate-500">Anonymous:</span> {survey.isAnonymous ? "Yes" : "No"}</p>
            </div>
          </Card>
        ))}
        {!data?.length ? <EmptyState title="No surveys" description="There are no surveys available for your account." /> : null}
      </div>
    </div>
  );
}
