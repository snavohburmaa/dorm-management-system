import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL?.trim() || "postgresql://localhost:5432/dorm_management";

const adapter = new PrismaPg({
  connectionString,
  ...(connectionString.includes("sslmode=require") && {
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
