import { execSync } from "node:child_process";

/** Przed testami: migracje na bazie testowej (DATABASE_URL_TEST), nigdy na dev. */
export default function setup() {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) return;
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
