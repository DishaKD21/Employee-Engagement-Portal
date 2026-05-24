import type { Response } from "express";
import { ApiResponse } from "./ApiResponse.js";
import { MESSAGES } from "../constants/messages.js";

function resolveMessage(message?: string) {
  if (!message) return MESSAGES.FETCHED;
  // If message matches a key in MESSAGES, return that value
  if ((MESSAGES as Record<string, string>)[message]) return (MESSAGES as Record<string, string>)[message];
  return message;
}

export function sendSuccess(res: Response, data: any = null, message?: string, status = 200) {
  const msg = resolveMessage(message);
  return res.status(status).json(new ApiResponse(msg, data));
}

export function sendCreated(res: Response, data: any = null, message?: string) {
  const msg = resolveMessage(message ?? MESSAGES.CREATED);
  return res.status(201).json(new ApiResponse(msg, data));
}

export default { sendSuccess, sendCreated };
