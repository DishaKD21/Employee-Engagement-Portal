import type { AxiosResponse } from "axios";
import { apiClient, unwrapApiResponse } from "@/modules/auth/services/auth.helpers";

export const surveyQuestionTypes = ["TEXT", "TEXTAREA", "RADIO", "CHECKBOX", "DROPDOWN"] as const;

export type SurveyQuestionType = (typeof surveyQuestionTypes)[number];

export type SurveyQuestionFormValue = {
  question_text: string;
  question_type: SurveyQuestionType;
  options: string[];
};

export type SurveyFormValues = {
  title: string;
  target_audience: string;
  open_date: string;
  close_date: string;
  is_anonymous: boolean;
  questions: SurveyQuestionFormValue[];
};

export type SurveyQuestionRecord = {
  questionId: number;
  surveyId: number | null;
  questionText: string | null;
  questionType: SurveyQuestionType | string | null;
  options: string[] | null;
};

export type SurveyRecord = {
  surveyId: number;
  title: string | null;
  targetAudience: string | null;
  openDate: string | null;
  closeDate: string | null;
  isAnonymous: boolean | null;
  createdBy: number | null;
  approvedStatus: string | null;
  createdAt: string;
  creator?: {
    employeeId: number;
    name: string;
    email: string;
  } | null;
  questions?: SurveyQuestionRecord[];
  approvalId?: number | null;
  workflowStatus?: string | null;
  hasSubmitted?: boolean;
};

export type SurveyApprovalRecord = {
  approvalId: number;
  status: string | null;
  comments: string | null;
  createdAt: string;
  survey: SurveyRecord | null;
};

export type SurveyAnswerRecord = {
  id: number;
  responseId: number | null;
  questionId: number | null;
  answerText: string | null;
};

export type SurveySubmissionRecord = {
  responseId: number;
  surveyId: number | null;
  employeeId: number | null;
  submittedAt: string;
  survey?: SurveyRecord | null;
  answers?: SurveyAnswerRecord[];
};

export type SurveySubmissionPayload = {
  answers: Array<{
    question_id: number;
    answer_text: string;
  }>;
};

async function postWithToken<T>(url: string, body: unknown, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.post(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

async function getWithToken<T>(url: string, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

async function putWithToken<T>(url: string, body: unknown, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.put(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

async function deleteWithToken<T>(url: string, token: string) {
  const response: AxiosResponse<T | { data?: T }> = await apiClient.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return unwrapApiResponse(response);
}

export async function createSurvey(input: SurveyFormValues, token: string) {
  return postWithToken<SurveyRecord>("/api/surveys/create", input, token);
}

export async function getMySurveys(token: string) {
  return getWithToken<SurveyRecord[]>("/api/surveys/my-surveys", token);
}

export async function updateSurvey(surveyId: number, input: Partial<SurveyFormValues>, token: string) {
  return putWithToken<SurveyRecord>(`/api/surveys/update/${surveyId}`, input, token);
}

export async function deleteSurvey(surveyId: number, token: string) {
  return deleteWithToken<{ deleted: boolean }>(`/api/surveys/delete/${surveyId}`, token);
}

export async function getPendingSurveyApprovals(token: string) {
  return getWithToken<SurveyApprovalRecord[]>("/api/survey-approvals/pending", token);
}

export async function approveSurvey(approvalId: number, token: string) {
  return putWithToken<SurveyApprovalRecord>(`/api/survey-approvals/approve/${approvalId}`, {}, token);
}

export async function rejectSurvey(approvalId: number, token: string, comments?: string) {
  return putWithToken<SurveyApprovalRecord>(`/api/survey-approvals/reject/${approvalId}`, { comments }, token);
}

export async function getPublishedSurveys(token: string) {
  return getWithToken<SurveyRecord[]>("/api/surveys/published", token);
}

export async function getSurveyById(surveyId: number, token: string) {
  return getWithToken<SurveyRecord>(`/api/surveys/${surveyId}`, token);
}

export async function submitSurvey(surveyId: number, input: SurveySubmissionPayload, token: string) {
  return postWithToken<SurveySubmissionRecord>(`/api/surveys/submit/${surveyId}`, input, token);
}

export async function getMySubmissions(token: string) {
  return getWithToken<SurveySubmissionRecord[]>("/api/surveys/my-submissions", token);
}
