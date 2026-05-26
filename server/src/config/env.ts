import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const smtpSecureSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean().optional().default(false));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1d"),
  EMPLOYEE_EMAIL_DOMAIN: z.string().default("ethanaegis.com"),
  FRONTEND_LOGIN_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  DEV_NOTIFICATION_EMAIL: z.string().email().optional(),
  SMTP_SECURE: smtpSecureSchema,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Environment validation failed: ${parsed.error.message}`);
}

export const env = parsed.data;