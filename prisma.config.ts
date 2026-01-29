import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // DATABASE_URL at runtime; fallback for build (e.g. Vercel) when var not set
    url: process.env.DATABASE_URL?.trim() || "postgresql://localhost:5432/dorm_management",
  },
});
