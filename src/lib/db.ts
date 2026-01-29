/**
 * Prisma client for dorm management database.
 * Use this when you add API routes or server actions that read/write the DB.
 * Prisma 7 requires a driver adapter for MySQL; we use @prisma/adapter-mariadb.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function getAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const u = new URL(url);
  return new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1) || undefined,
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: getAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
