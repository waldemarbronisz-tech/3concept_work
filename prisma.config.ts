import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Brak zmiennej = czytelny błąd z Prismy, a nie połączenie z „undefined”.
    url: process.env.DATABASE_URL ?? "",
  },
});
