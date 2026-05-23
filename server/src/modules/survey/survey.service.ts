import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import type { SubmitSurveyInput } from "./survey.types.js";

export const surveyService = {
  async getSurvey(surveyId: number, employeeId?: number) {
    const survey = await prisma.survey.findUnique({
      where: { surveyId },
      include: {
        questions: true,
        responses: employeeId ? { where: { employeeId } } : true,
      },
    });

    if (!survey) {
      throw new ApiError(404, "Survey not found");
    }

    return survey;
  },

  async listSurveys() {
    return prisma.survey.findMany({ orderBy: { createdAt: "desc" }, include: { questions: true } });
  },

  async submitSurvey(surveyId: number, employeeId: number, input: SubmitSurveyInput) {
    const response = await prisma.surveyResponse.create({
      data: {
        surveyId,
        employeeId,
        answers: {
          create: input.answers.map((answer) => ({
            questionId: answer.questionId,
            answerText: answer.answerText,
          })),
        },
      },
      include: { answers: true },
    });

    return response;
  },
};