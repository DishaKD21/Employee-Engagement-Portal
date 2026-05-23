import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const connectDatabase = async () => {
  await prisma.$connect();
  logger.info("Database connected successfully");
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info("Database disconnected");
};