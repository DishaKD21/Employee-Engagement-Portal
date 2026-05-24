import jwt, { type Secret } from "jsonwebtoken";
import { env } from "../../config/env.js";

export type JwtPayload = {
  id: number;
  employeeId: number | null;
  email: string;
  role: string;
};

export const signToken = (payload: JwtPayload) => {
  const secret: Secret = env.JWT_SECRET as Secret;
  return jwt.sign(payload as string | object, secret, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
