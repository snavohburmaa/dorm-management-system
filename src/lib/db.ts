/**
 * Prisma client for dorm management database.
 * Use this when you add API routes or server actions that read/write the DB.
 * Prisma 7 requires a driver adapter for PostgreSQL; we use @prisma/adapter-pg.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaPg({ connectionString: url });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: getAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
