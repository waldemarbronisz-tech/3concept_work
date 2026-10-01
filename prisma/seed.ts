// Seed developerski — tylko dane fikcyjne (faza beta). Idempotentny: upsert.
import { db } from "../src/core/db";

const SETTINGS: Array<{ key: string; value: string | number | boolean }> = [
  { key: "company.name", value: "3Concept" },
  { key: "app.beta", value: true },
];

async function main() {
  for (const { key, value } of SETTINGS) {
    await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log(`Seed: ${SETTINGS.length} ustawień.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
