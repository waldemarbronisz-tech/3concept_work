import { afterAll, describe, expect, it } from "vitest";

// Test integracyjny: wymaga bazy testowej (DATABASE_URL_TEST → DATABASE_URL w vitest.config).
const url = process.env.DATABASE_URL;
const db = url ? (await import("./db")).db : null;

describe.skipIf(!db)("db", () => {
  afterAll(() => db?.$disconnect());

  it("łączy się z bazą testową, nie deweloperską", async () => {
    expect(url).toMatch(/_test\b/);
    const rows = await db!.$queryRaw<[{ ok: number }]>`SELECT 1 AS ok`;
    expect(rows[0]?.ok).toBe(1);
  });

  it("ma zastosowane migracje (tabela app_setting)", async () => {
    await expect(db!.appSetting.count()).resolves.toBeGreaterThanOrEqual(0);
  });
});
