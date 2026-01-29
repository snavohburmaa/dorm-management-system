import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL?.trim() || "postgresql://localhost:5432/dorm_management";

const needsSslAcceptSelfSigned =
  connectionString.includes("sslmode=require") || connectionString.includes("supabase.co");

const adapter = new PrismaPg({
  connectionString,
  ...(needsSslAcceptSelfSigned && {
    ssl: { rejectUnauthorized: false },
  }),
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
