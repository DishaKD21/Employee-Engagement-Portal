import React from "react";
import EmployeeSurveyFillView from "@/modules/surveys/views/EmployeeSurveyFillView";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const surveyId = Number(resolvedParams.id);

  return <EmployeeSurveyFillView surveyId={surveyId} />;
}
