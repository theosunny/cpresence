/**
 * Prisma client singleton for MySQL (Prisma 7).
 *
 * Prisma 7 moves the connection URL from schema to the client constructor.
 * Configure DATABASE_URL in .env and prisma.config.ts.
 */

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
