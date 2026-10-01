// Seed developerski — tylko dane fikcyjne (faza beta). Idempotentny: upsert / pomijanie istniejących.
import { createAccount } from "../src/core/auth/accounts";
import { db } from "../src/core/db";
import { SYSTEM_ACTOR, type Role } from "../src/core/rbac";

const SETTINGS: Array<{ key: string; value: string | number | boolean }> = [
  { key: "company.name", value: "3Concept" },
  { key: "app.beta", value: true },
];

/** Konta testowe. Hasła tymczasowe są jawne, bo to tylko lokalna beta; przy logowaniu trzeba je zmienić. */
const ACCOUNTS: Array<{
  username: string;
  name: string;
  temporaryPassword: string;
  roles: Array<{ role: Role; siteId?: string }>;
}> = [
  {
    username: "admin",
    name: "Administrator",
    temporaryPassword: "tymczasowe1",
    roles: [{ role: "ADMIN" }],
  },
  {
    username: "jkowalski",
    name: "Jan Kowalski",
    temporaryPassword: "tymczasowe1",
    roles: [{ role: "WORKER" }],
  },
];

async function main() {
  for (const { key, value } of SETTINGS) {
    await db.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log(`Seed: ${SETTINGS.length} ustawień.`);

  for (const account of ACCOUNTS) {
    const existing = await db.user.findUnique({ where: { username: account.username } });
    const userId = existing
      ? existing.id
      : (await createAccount(SYSTEM_ACTOR, { ...account, roles: [] })).userId;
    if (!existing) {
      console.log(
        `Seed: konto ${account.username} (hasło tymczasowe: ${account.temporaryPassword})`,
      );
    }
    // Role dopisywane tylko, gdy brakuje — seed można uruchamiać wielokrotnie.
    for (const { role, siteId = null } of account.roles) {
      const has = await db.roleAssignment.findFirst({
        where: { userId, role, siteId, validTo: null },
      });
      if (!has) {
        await db.roleAssignment.create({ data: { userId, role, siteId } });
        console.log(`Seed: rola ${role}${siteId ? ` @ ${siteId}` : ""} → ${account.username}`);
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
