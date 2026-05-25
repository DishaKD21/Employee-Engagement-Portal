import { z } from "zod";

export const surveyQuestionTypes = ["TEXT", "TEXTAREA", "RADIO", "CHECKBOX", "DROPDOWN"] as const;

const surveyQuestionSchema = z.object({
  question_text: z.string().trim().min(1, "Question text is required").max(500),
  question_type: z.enum(surveyQuestionTypes),
  options: z.array(z.string().trim().min(1, "Option cannot be empty")).optional(),
}).superRefine((value, ctx) => {
  const requiresOptions = ["RADIO", "CHECKBOX", "DROPDOWN"].includes(value.question_type);

  if (requiresOptions && (!value.options || value.options.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["options"],
      message: "Options are required for selected question types",
    });
  }
});

const surveyBaseSchema = z.object({
  title: z.string().trim().min(1, "Survey title is required").max(200),
  target_audience: z.string().trim().min(1, "Target audience is required").max(100),
  open_date: z.coerce.date(),
  close_date: z.coerce.date(),
  is_anonymous: z.boolean(),
  questions: z.array(surveyQuestionSchema).min(1, "At least one question is required"),
});

const dateValidatedBase = surveyBaseSchema.superRefine((value, ctx) => {
  if (value.open_date > value.close_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["close_date"],
      message: "Close date must be after open date",
    });
  }
});

export const createSurveySchema = dateValidatedBase;

export const updateSurveySchema = surveyBaseSchema.partial().superRefine((value, ctx) => {
  if (value.open_date && value.close_date && value.open_date > value.close_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["close_date"],
      message: "Close date must be after open date",
    });
  }
});

export const submitSurveySchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.number().int().positive(),
      answer_text: z.string().trim().min(1, "Answer is required").max(5000),
    }),
  ).min(1, "At least one answer is required"),
});

export const rejectSurveySchema = z.object({
  comments: z.string().trim().max(1000).optional(),
});
