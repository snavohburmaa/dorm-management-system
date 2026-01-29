import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma client for Supabase (PostgreSQL).
 * Uses @prisma/adapter-pg; SSL is enabled for supabase.co and when sslmode=require.
 */
const connectionString = process.env.DATABASE_URL?.trim();

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma(): PrismaClient {
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const isSupabase =
    connectionString.includes("sslmode=require") || connectionString.includes("supabase.co");
  const adapter = new PrismaPg({
    connectionString,
    ...(isSupabase && { ssl: { rejectUnauthorized: false } }),
  });
  return new PrismaClient({ adapter });
}

/** Connected when DATABASE_URL is set (e.g. Supabase); null otherwise. */
export const prisma: PrismaClient | null = connectionString
  ? (globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrisma()))
  : null;
