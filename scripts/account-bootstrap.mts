// Pierwsze wdrożenie: nadaje MANAGEMENT + ADMIN istniejącemu kontu z linii poleceń,
// z wpisami audytu z aktorem „system”. Użycie: npm run account:bootstrap -- --login <login>
import { db } from "../src/core/db";
import { grantRole, SYSTEM_ACTOR } from "../src/core/rbac";

const args = process.argv.slice(2);
const login = args[args.indexOf("--login") + 1];
if (!args.includes("--login") || !login) {
  console.error("Użycie: npm run account:bootstrap -- --login <login>");
  process.exit(2);
}

const user = await db.user.findUnique({ where: { username: login.toLowerCase() } });
if (!user) {
  console.error(`Brak konta „${login}”. Załóż je najpierw (ekran admina albo seed).`);
  process.exit(1);
}

for (const role of ["MANAGEMENT", "ADMIN"] as const) {
  const assignment = await grantRole(SYSTEM_ACTOR, {
    userId: user.id,
    role,
    reason: "bootstrap z linii poleceń",
  });
  console.log(`${role} → ${login} (przypisanie ${assignment.id})`);
}
await db.$disconnect();
