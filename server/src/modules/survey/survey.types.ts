export type SubmitSurveyInput = {
  answers: Array<{
    questionId: number;
    answerText: string;
  }>;
};