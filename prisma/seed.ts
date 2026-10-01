// Seed developerski — tylko dane fikcyjne (faza beta). Idempotentny: upsert / pomijanie istniejących.
import { createAccount } from "../src/core/auth/accounts";
import { db } from "../src/core/db";

const SETTINGS: Array<{ key: string; value: string | number | boolean }> = [
  { key: "company.name", value: "3Concept" },
  { key: "app.beta", value: true },
];

/** Konta testowe. Hasła tymczasowe są jawne, bo to tylko lokalna beta; przy logowaniu trzeba je zmienić. */
const ACCOUNTS = [
  { username: "admin", name: "Administrator", temporaryPassword: "tymczasowe1" },
  { username: "jkowalski", name: "Jan Kowalski", temporaryPassword: "tymczasowe1" },
];

async function main() {
  for (const { key, value } of SETTINGS) {
    await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log(`Seed: ${SETTINGS.length} ustawień.`);

  for (const account of ACCOUNTS) {
    const exists = await db.user.findUnique({ where: { username: account.username } });
    if (exists) continue;
    await createAccount(account);
    console.log(`Seed: konto ${account.username} (hasło tymczasowe: ${account.temporaryPassword})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
