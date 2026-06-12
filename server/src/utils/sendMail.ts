import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { ApiError } from "../common/utils/ApiError.js";
import { logger } from "../config/logger.js";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new ApiError(500, "Email service is not configured");
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendMail(payload: MailPayload) {
  const mailer = getTransporter();
  const mirroredRecipient = env.DEV_NOTIFICATION_EMAIL;

  try {
    if (mirroredRecipient) {
      logger.info("Mail mirror enabled", {
        to: payload.to,
        bcc: mirroredRecipient,
        subject: payload.subject,
      });
    }

    return await mailer.sendMail({
      from: env.SMTP_FROM ?? env.SMTP_USER,
      to: payload.to,
      bcc: mirroredRecipient,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  } catch (error) {
    logger.error("Nodemailer sendMail failed", {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      code: error instanceof Error ? (error as Error & { code?: string }).code : undefined,
      command: error instanceof Error ? (error as Error & { command?: string }).command : undefined,
      response: error instanceof Error ? (error as Error & { response?: string }).response : undefined,
      responseCode: error instanceof Error ? (error as Error & { responseCode?: number }).responseCode : undefined,
      message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}