/**
 * Prisma client for dorm management database.
 * Use this when you add API routes or server actions that read/write the DB.
 * Prisma 7 requires a driver adapter for PostgreSQL; we use @prisma/adapter-pg.
 * Client is created lazily (on first use) so build can succeed when DATABASE_URL is not set (e.g. Vercel build).
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function getAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const connectionString = url.replace(/\?.*$/, "");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  return new PrismaPg(pool);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  globalForPrisma.prisma = new PrismaClient({ adapter: getAdapter() });
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as Record<string | symbol, unknown>)[prop];
  },
});
