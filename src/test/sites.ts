import { db } from "@/core/db";

/** Budowa testowa o danym numerze (idempotentnie) — role budowy wymagają istniejącej budowy (FK). */
export async function ensureSites(...siteNumbers: string[]) {
  for (const siteNumber of siteNumbers) {
    await db.site.upsert({
      where: { siteNumber },
      update: {},
      create: {
        siteNumber,
        name: `Budowa testowa ${siteNumber}`,
        client: "test",
        location: "test",
      },
    });
  }
}
