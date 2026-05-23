import { z } from "zod";

export const submitSurveySchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answerText: z.string().min(1),
    }),
  ).min(1),
});