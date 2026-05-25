import { ApprovalStatus, ContentType } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../common/utils/ApiError.js";
import type { CreateSurveyInput, RejectSurveyInput, SubmitSurveyInput, UpdateSurveyInput } from "./survey.types.js";

function ensureValidId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "Invalid id");
  }
}

function isSurveyApproved(survey: { approvedStatus: ApprovalStatus | null }) {
  return survey.approvedStatus === ApprovalStatus.approved;
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSurveyActive(survey: { openDate: Date | null; closeDate: Date | null }) {
  const todayKey = toDateKey(new Date());

  if (survey.openDate && todayKey < toDateKey(survey.openDate)) {
    return false;
  }

  if (survey.closeDate && todayKey > toDateKey(survey.closeDate)) {
    return false;
  }

  return true;
}

function normalizeQuestionOptions(options?: string[] | null) {
  const normalized = options?.map((option) => option.trim()).filter(Boolean) ?? [];
  return normalized.length ? normalized : undefined;
}

async function getSurveyOrThrow(surveyId: number) {
  const survey = await prisma.survey.findUnique({
    where: { surveyId },
    include: {
      creator: {
        select: {
          employeeId: true,
          name: true,
          email: true,
        },
      },
      questions: true,
    },
  });

  if (!survey) {
    throw new ApiError(404, "Survey not found");
  }

  return survey;
}

async function loadPendingSurveyApprovals() {
  const approvals = await prisma.approval.findMany({
    where: {
      contentType: ContentType.survey,
      status: ApprovalStatus.pending,
    },
    orderBy: { createdAt: "asc" },
  });

  const surveys = await prisma.survey.findMany({
    where: {
      surveyId: {
        in: approvals.map((approval) => approval.contentId).filter((value): value is number => value !== null),
      },
    },
    include: {
      creator: {
        select: {
          employeeId: true,
          name: true,
          email: true,
        },
      },
      questions: true,
    },
  });

  const surveyById = new Map(surveys.map((survey) => [survey.surveyId, survey]));

  return approvals
    .filter((approval) => approval.contentId !== null)
    .map((approval) => ({
      approvalId: approval.approvalId,
      status: approval.status,
      comments: approval.comments,
      createdAt: approval.createdAt,
      survey: surveyById.get(approval.contentId as number) ?? null,
    }));
}

type SurveyQuestionInput = CreateSurveyInput["questions"][number];
type SurveyQuestionUpdateInput = NonNullable<UpdateSurveyInput["questions"]>[number];

function buildSurveyQuestionData(question: SurveyQuestionInput | SurveyQuestionUpdateInput) {
  return {
    questionText: question.question_text.trim(),
    questionType: question.question_type,
    options: normalizeQuestionOptions(question.options),
  };
}

export const surveyService = {
  async createSurvey(input: CreateSurveyInput, creatorEmployeeId: number) {
    const created = await prisma.$transaction(async (tx) => {
      const survey = await tx.survey.create({
        data: {
          title: input.title.trim(),
          targetAudience: input.target_audience.trim(),
          openDate: input.open_date,
          closeDate: input.close_date,
          isAnonymous: input.is_anonymous,
          createdBy: creatorEmployeeId,
          approvedStatus: ApprovalStatus.pending,
        },
      });

      if (input.questions.length > 0) {
        await tx.surveyQuestion.createMany({
          data: input.questions.map((question) => ({
            surveyId: survey.surveyId,
            ...buildSurveyQuestionData(question),
          })),
        });
      }

      const approval = await tx.approval.create({
        data: {
          contentType: ContentType.survey,
          contentId: survey.surveyId,
          status: ApprovalStatus.pending,
        },
      });

      return { survey, approval };
    });

    return {
      ...created.survey,
      approvalId: created.approval.approvalId,
      workflowStatus: ApprovalStatus.pending,
    };
  },

  async getMySurveys(creatorEmployeeId: number) {
    const surveys = await prisma.survey.findMany({
      where: { createdBy: creatorEmployeeId },
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            employeeId: true,
            name: true,
            email: true,
          },
        },
        questions: true,
      },
    });

    const approvals = await prisma.approval.findMany({
      where: {
        contentType: ContentType.survey,
        contentId: { in: surveys.map((survey) => survey.surveyId) },
      },
    });

    const approvalByContentId = new Map(approvals.map((approval) => [approval.contentId ?? 0, approval]));

    return surveys.map((survey) => ({
      ...survey,
      approvalId: approvalByContentId.get(survey.surveyId)?.approvalId ?? null,
      workflowStatus: approvalByContentId.get(survey.surveyId)?.status ?? survey.approvedStatus,
    }));
  },

  async updateSurvey(surveyId: number, creatorEmployeeId: number, input: UpdateSurveyInput) {
    ensureValidId(surveyId);

    const survey = await getSurveyOrThrow(surveyId);

    if (survey.createdBy !== creatorEmployeeId) {
      throw new ApiError(403, "Forbidden");
    }

    if (isSurveyApproved(survey)) {
      throw new ApiError(400, "Only non-approved surveys can be updated");
    }

    const approval = await prisma.approval.findFirst({
      where: {
        contentType: ContentType.survey,
        contentId: surveyId,
      },
    });

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSurvey = await tx.survey.update({
        where: { surveyId },
        data: {
          title: input.title?.trim() ?? undefined,
          targetAudience: input.target_audience?.trim() ?? undefined,
          openDate: input.open_date,
          closeDate: input.close_date,
          isAnonymous: input.is_anonymous,
          approvedStatus: ApprovalStatus.pending,
        },
      });

      if (input.questions) {
        await tx.surveyQuestion.deleteMany({ where: { surveyId } });

        await tx.surveyQuestion.createMany({
          data: input.questions.map((question) => ({
            surveyId: updatedSurvey.surveyId,
            ...buildSurveyQuestionData(question),
          })),
        });
      }

      if (approval) {
        await tx.approval.update({
          where: { approvalId: approval.approvalId },
          data: {
            status: ApprovalStatus.pending,
            reviewerId: null,
            comments: null,
          },
        });
      } else {
        await tx.approval.create({
          data: {
            contentType: ContentType.survey,
            contentId: surveyId,
            status: ApprovalStatus.pending,
          },
        });
      }

      return tx.survey.findUnique({
        where: { surveyId },
        include: {
          creator: {
            select: {
              employeeId: true,
              name: true,
              email: true,
            },
          },
          questions: true,
        },
      });
    });

    if (!updated) {
      throw new ApiError(404, "Survey not found");
    }

    const refreshedApproval = await prisma.approval.findFirst({
      where: {
        contentType: ContentType.survey,
        contentId: surveyId,
      },
    });

    return {
      ...updated,
      approvalId: refreshedApproval?.approvalId ?? null,
      workflowStatus: refreshedApproval?.status ?? ApprovalStatus.pending,
    };
  },

  async deleteSurvey(surveyId: number, creatorEmployeeId: number) {
    ensureValidId(surveyId);

    const survey = await getSurveyOrThrow(surveyId);

    if (survey.createdBy !== creatorEmployeeId) {
      throw new ApiError(403, "Forbidden");
    }

    if (isSurveyApproved(survey)) {
      throw new ApiError(400, "Only non-approved surveys can be deleted");
    }

    await prisma.$transaction([
      prisma.approval.deleteMany({
        where: {
          contentType: ContentType.survey,
          contentId: surveyId,
        },
      }),
      prisma.survey.delete({ where: { surveyId } }),
    ]);

    return { deleted: true };
  },

  async getPendingApprovals() {
    return loadPendingSurveyApprovals();
  },

  async approveSurvey(approvalId: number, reviewerEmployeeId: number) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval || approval.contentType !== ContentType.survey || approval.contentId === null) {
      throw new ApiError(404, "Approval not found");
    }

    if (approval.status !== ApprovalStatus.pending) {
      throw new ApiError(400, "Approval is already processed");
    }

    const survey = await prisma.survey.findUnique({ where: { surveyId: approval.contentId } });

    if (!survey) {
      throw new ApiError(404, "Survey not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { approvalId },
        data: {
          status: ApprovalStatus.approved,
          reviewerId: reviewerEmployeeId,
        },
      });

      const updatedSurvey = await tx.survey.update({
        where: { surveyId: survey.surveyId },
        data: {
          approvedStatus: ApprovalStatus.approved,
        },
        include: {
          creator: {
            select: {
              employeeId: true,
              name: true,
              email: true,
            },
          },
          questions: true,
        },
      });

      return { updatedApproval, updatedSurvey };
    });

    return {
      approvalId: result.updatedApproval.approvalId,
      status: result.updatedApproval.status,
      survey: result.updatedSurvey,
    };
  },

  async rejectSurvey(approvalId: number, reviewerEmployeeId: number, input?: RejectSurveyInput) {
    const approval = await prisma.approval.findUnique({ where: { approvalId } });

    if (!approval || approval.contentType !== ContentType.survey || approval.contentId === null) {
      throw new ApiError(404, "Approval not found");
    }

    if (approval.status !== ApprovalStatus.pending) {
      throw new ApiError(400, "Approval is already processed");
    }

    const survey = await prisma.survey.findUnique({ where: { surveyId: approval.contentId } });

    if (!survey) {
      throw new ApiError(404, "Survey not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { approvalId },
        data: {
          status: ApprovalStatus.rejected,
          reviewerId: reviewerEmployeeId,
          comments: input?.comments?.trim() || approval.comments,
        },
      });

      const updatedSurvey = await tx.survey.update({
        where: { surveyId: survey.surveyId },
        data: {
          approvedStatus: ApprovalStatus.rejected,
        },
        include: {
          creator: {
            select: {
              employeeId: true,
              name: true,
              email: true,
            },
          },
          questions: true,
        },
      });

      return { updatedApproval, updatedSurvey };
    });

    return {
      approvalId: result.updatedApproval.approvalId,
      status: result.updatedApproval.status,
      survey: result.updatedSurvey,
    };
  },

  async getPublishedSurveys() {
    const surveys = await prisma.survey.findMany({
      where: {
        approvedStatus: ApprovalStatus.approved,
      },
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            employeeId: true,
            name: true,
            email: true,
          },
        },
        questions: true,
      },
    });

    return surveys.filter((survey) => isSurveyActive(survey));
  },

  async getSurveyById(surveyId: number) {
    ensureValidId(surveyId);

    const survey = await getSurveyOrThrow(surveyId);

    if (!isSurveyApproved(survey) || !isSurveyActive(survey)) {
      throw new ApiError(404, "Survey not found");
    }

    return survey;
  },

  async submitSurvey(surveyId: number, employeeId: number, input: SubmitSurveyInput) {
    ensureValidId(surveyId);

    const survey = await prisma.survey.findUnique({
      where: { surveyId },
      include: { questions: true },
    });

    if (!survey || !isSurveyApproved(survey) || !isSurveyActive(survey)) {
      throw new ApiError(404, "Survey not found");
    }

    const existing = await prisma.surveyResponse.findFirst({
      where: { surveyId, employeeId },
    });

    if (existing) {
      throw new ApiError(409, "You have already submitted this survey");
    }

    const questionIds = new Set(survey.questions.map((question) => question.questionId));

    for (const answer of input.answers) {
      if (!questionIds.has(answer.question_id)) {
        throw new ApiError(400, "One or more answers reference invalid questions");
      }
    }

    const response = await prisma.$transaction(async (tx) => {
      const surveyResponse = await tx.surveyResponse.create({
        data: {
          surveyId,
          employeeId,
        },
      });

      await tx.surveyAnswer.createMany({
        data: input.answers.map((answer) => ({
          responseId: surveyResponse.responseId,
          questionId: answer.question_id,
          answerText: answer.answer_text.trim(),
        })),
      });

      return tx.surveyResponse.findUnique({
        where: { responseId: surveyResponse.responseId },
        include: {
          survey: {
            include: {
              creator: {
                select: {
                  employeeId: true,
                  name: true,
                  email: true,
                },
              },
              questions: true,
            },
          },
          answers: true,
        },
      });
    });

    if (!response) {
      throw new ApiError(500, "Failed to submit survey");
    }

    return response;
  },

  async getMySubmissions(employeeId: number) {
    return prisma.surveyResponse.findMany({
      where: { employeeId },
      orderBy: { submittedAt: "desc" },
      include: {
        survey: {
          include: {
            creator: {
              select: {
                employeeId: true,
                name: true,
                email: true,
              },
            },
            questions: true,
          },
        },
        answers: true,
      },
    });
  },
};
