import type { ApprovalStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createSurveySchema,
  rejectSurveySchema,
  submitSurveySchema,
  updateSurveySchema,
  surveyQuestionTypes,
} from "./survey.validation.js";

export type SurveyQuestionType = (typeof surveyQuestionTypes)[number];

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>;
export type SubmitSurveyInput = z.infer<typeof submitSurveySchema>;
export type RejectSurveyInput = z.infer<typeof rejectSurveySchema>;

export type SurveyCreator = {
  employeeId: number;
  name: string;
  email: string;
};

export type SurveyQuestionRecord = {
  questionId: number;
  surveyId: number | null;
  questionText: string | null;
  questionType: string | null;
  options: Prisma.JsonValue | null;
};

export type SurveyRecord = {
  surveyId: number;
  title: string | null;
  targetAudience: string | null;
  openDate: Date | null;
  closeDate: Date | null;
  isAnonymous: boolean | null;
  createdBy: number | null;
  approvedStatus: ApprovalStatus | null;
  createdAt: Date;
  creator?: SurveyCreator | null;
  questions?: SurveyQuestionRecord[];
  approvalId?: number | null;
  workflowStatus?: ApprovalStatus | null;
  hasSubmitted?: boolean;
};

export type SurveyApprovalView = {
  approvalId: number;
  status: ApprovalStatus | null;
  comments: string | null;
  createdAt: Date;
  survey: SurveyRecord | null;
};

export type SurveyAnswerRecord = {
  id: number;
  responseId: number | null;
  questionId: number | null;
  answerText: string | null;
};

export type SurveyResponseRecord = {
  responseId: number;
  surveyId: number | null;
  employeeId: number | null;
  submittedAt: Date;
  survey?: SurveyRecord | null;
  answers?: SurveyAnswerRecord[];
};
