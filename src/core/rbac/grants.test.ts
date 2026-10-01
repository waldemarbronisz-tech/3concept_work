import { afterAll, describe, expect, it } from "vitest";
import { ROLES } from "./roles";

// Integracyjne (pomijane bez DATABASE_URL_TEST): role z bazy, zgodność enumów, reset wg ról.
const url = process.env.DATABASE_URL;
const mods = url
  ? {
      db: (await import("@/core/db")).db,
      prisma: await import("@/generated/prisma/enums"),
      grants: await import("./grants"),
      accounts: await import("@/core/auth/accounts"),
      rbac: await import("./index"),
    }
  : null;

describe.skipIf(!mods)("role w bazie", () => {
  const prefix = `r${Date.now().toString(36)}`;
  afterAll(() => mods!.db.$disconnect());

  it("enum Role w Prismie = ROLES w core/rbac", () => {
    expect(Object.values(mods!.prisma.Role).sort()).toEqual([...ROLES].sort());
  });

  it("ładuje tylko aktywne przypisania", async () => {
    const { userId } = await mods!.accounts.createAccount(mods!.rbac.SYSTEM_ACTOR, {
      username: `${prefix}.roles`,
      name: "Test Ról",
      roles: [{ role: "FOREMAN", siteId: "site-a" }, { role: "WORKER" }],
    });
    await mods!.db.roleAssignment.create({
      data: {
        userId,
        role: "SITE_ENGINEER",
        siteId: "site-b",
        validTo: new Date(Date.now() - 1000),
      },
    });
    await mods!.db.roleAssignment.create({
      data: { userId, role: "MANAGEMENT", validFrom: new Date(Date.now() + 86_400_000) },
    });

    const grants = await mods!.grants.loadGrants(userId);
    expect(grants).toEqual([
      { role: "FOREMAN", siteId: "site-a" },
      { role: "WORKER", siteId: null },
    ]);
    expect(await mods!.grants.loadUserSiteIds(userId)).toEqual(["site-a"]);
  });

  it("kierownik resetuje hasło pracownikowi ze swojej budowy, ale nie z cudzej ani adminowi", async () => {
    const manager = await mods!.accounts.createAccount(mods!.rbac.SYSTEM_ACTOR, {
      username: `${prefix}.kier`,
      name: "Kierownik",
      roles: [{ role: "CONTRACT_MANAGER", siteId: "site-a" }],
    });
    const managerActor = {
      userId: manager.userId,
      grants: await mods!.grants.loadGrants(manager.userId),
    };
    const own = await mods!.accounts.createAccount(mods!.rbac.SYSTEM_ACTOR, {
      username: `${prefix}.swoj`,
      name: "Swój Brygadzista",
      roles: [{ role: "FOREMAN", siteId: "site-a" }],
    });
    const foreign = await mods!.accounts.createAccount(mods!.rbac.SYSTEM_ACTOR, {
      username: `${prefix}.obcy`,
      name: "Obcy Brygadzista",
      roles: [{ role: "FOREMAN", siteId: "site-b" }],
    });
    const admin = await mods!.accounts.createAccount(mods!.rbac.SYSTEM_ACTOR, {
      username: `${prefix}.admin`,
      name: "Admin",
      roles: [{ role: "ADMIN" }],
    });

    await expect(mods!.accounts.resetPassword(managerActor, own.userId)).resolves.toHaveProperty(
      "temporaryPassword",
    );
    await expect(mods!.accounts.resetPassword(managerActor, foreign.userId)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    await expect(mods!.accounts.resetPassword(managerActor, admin.userId)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
  });

  it("baza odrzuca niepoprawny zakres roli (CHECK role_assignment_scope_check)", async () => {
    const { userId } = await mods!.accounts.createAccount(mods!.rbac.SYSTEM_ACTOR, {
      username: `${prefix}.check`,
      name: "Check",
    });
    const create = (role: "ADMIN" | "MANAGEMENT" | "FOREMAN" | "WORKER", siteId: string | null) =>
      mods!.db.roleAssignment.create({ data: { userId, role, siteId } });

    await expect(create("ADMIN", "site-a")).rejects.toThrow(/check/i);
    await expect(create("MANAGEMENT", "site-a")).rejects.toThrow(/check/i);
    await expect(create("FOREMAN", null)).rejects.toThrow(/check/i);
    await expect(create("WORKER", null)).resolves.toBeTruthy();
    await expect(create("WORKER", "site-a")).resolves.toBeTruthy();
  });

  it("pracownik nie założy konta", async () => {
    const worker = { userId: "x", grants: [{ role: "WORKER" as const, siteId: null }] };
    await expect(
      mods!.accounts.createAccount(worker, { username: `${prefix}.nie`, name: "Nie" }),
    ).rejects.toThrow(mods!.rbac.ForbiddenError);
  });
});
