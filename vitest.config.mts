import "dotenv/config";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Testy łączą się tylko z bazą testową (DATABASE_URL_TEST z .env);
// bez niej testy integracyjne są pomijane, a baza dev nigdy nie jest dotykana.
const testDatabaseUrl = process.env.DATABASE_URL_TEST ?? "";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
    // Testy bazodanowe współdzielą jedną bazę — pliki po kolei, nie równolegle.
    fileParallelism: !testDatabaseUrl,
    env: { DATABASE_URL: testDatabaseUrl },
    globalSetup: testDatabaseUrl ? ["vitest.global-setup.mts"] : [],
  },
});
