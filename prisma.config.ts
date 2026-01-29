import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // DATABASE_URL at runtime; placeholder for build when var not set (no localhost)
    url: process.env.DATABASE_URL?.trim() || "postgresql://placeholder:5432/placeholder",
  },
});
