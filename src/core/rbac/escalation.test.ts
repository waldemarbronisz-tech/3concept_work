import { afterAll, describe, expect, it } from "vitest";
import { assertNotLastAdmin, canManageManagementAccount, canManageManagementRole } from "./guards";
import type { AuthorizationActor } from "./authorize";

const actor = (
  userId: string,
  ...roles: Array<"ADMIN" | "MANAGEMENT" | "WORKER">
): AuthorizationActor => ({
  userId,
  grants: roles.map((role) => ({ role, siteId: null })),
});

describe("reguły przeciw eskalacji (czyste)", () => {
  it("MANAGEMENT nadaje tylko ADMIN+MANAGEMENT", () => {
    expect(canManageManagementRole(actor("a", "ADMIN"))).toBe(false);
    expect(canManageManagementRole(actor("a", "MANAGEMENT"))).toBe(false);
    expect(canManageManagementRole(actor("a", "ADMIN", "MANAGEMENT"))).toBe(true);
  });

  it("kontem zarządu zarządza tylko MANAGEMENT z accounts.manage", () => {
    expect(canManageManagementAccount(actor("a", "ADMIN"))).toBe(false);
    expect(canManageManagementAccount(actor("a", "MANAGEMENT"))).toBe(false);
    expect(canManageManagementAccount(actor("a", "ADMIN", "MANAGEMENT"))).toBe(true);
  });

  it("ostatni admin", () => {
    expect(() => assertNotLastAdmin(0, "zablokować")).toThrow(/ostatni/);
    expect(() => assertNotLastAdmin(1, "zablokować")).not.toThrow();
  });
});

// Integracyjne (pomijane bez DATABASE_URL_TEST). Pliki testów bazodanowych nie biegną równolegle.
const url = process.env.DATABASE_URL;
const mods = url
  ? {
      db: (await import("@/core/db")).db,
      rbac: await import("./index"),
      accounts: await import("@/core/auth/accounts"),
    }
  : null;

describe.skipIf(!mods)("eskalacja uprawnień w bazie", () => {
  const prefix = `x${Date.now().toString(36)}`;
  const mk = (name: string, roles: Array<{ role: "ADMIN" | "MANAGEMENT" | "WORKER" }>) =>
    mods!.accounts.createAccount(mods!.rbac.SYSTEM_ACTOR, {
      username: `${prefix}.${name}`,
      name,
      roles,
    });
  const asActor = async (userId: string): Promise<AuthorizationActor> => ({
    userId,
    grants: await (await import("./grants")).loadGrants(userId),
  });
  afterAll(() => mods!.db.$disconnect());

  it("admin nie nadaje sobie MANAGEMENT ani nie odbiera sobie roli", async () => {
    const admin = await mk("admin1", [{ role: "ADMIN" }]);
    const me = await asActor(admin.userId);
    await expect(
      mods!.rbac.grantRole(me, { userId: admin.userId, role: "MANAGEMENT" }),
    ).rejects.toThrow(/własnego/);
    const own = await mods!.db.roleAssignment.findFirstOrThrow({
      where: { userId: admin.userId, role: "ADMIN" },
    });
    await expect(mods!.rbac.revokeRole(me, { assignmentId: own.id })).rejects.toThrow(/własnego/);
  });

  it("admin bez MANAGEMENT nie nadaje nikomu MANAGEMENT; ADMIN+MANAGEMENT może", async () => {
    const admin = await mk("admin2", [{ role: "ADMIN" }]);
    const boss = await mk("boss", [{ role: "ADMIN" }, { role: "MANAGEMENT" }]);
    const target = await mk("cel", [{ role: "WORKER" }]);
    await expect(
      mods!.rbac.grantRole(await asActor(admin.userId), {
        userId: target.userId,
        role: "MANAGEMENT",
      }),
    ).rejects.toThrow(mods!.rbac.ForbiddenError);

    const granted = await mods!.rbac.grantRole(await asActor(boss.userId), {
      userId: target.userId,
      role: "MANAGEMENT",
    });
    expect(granted.role).toBe("MANAGEMENT");
    await expect(
      mods!.rbac.revokeRole(await asActor(admin.userId), { assignmentId: granted.id }),
    ).rejects.toThrow(mods!.rbac.ForbiddenError);
    await mods!.rbac.revokeRole(await asActor(boss.userId), { assignmentId: granted.id });
  });

  it("ostatniego aktywnego admina nie da się pozbawić roli ani zablokować", async () => {
    const other = await mk("admin3", [{ role: "ADMIN" }]);
    const last = await mk("admin4", [{ role: "ADMIN" }]);
    // Zamykamy wszystkie inne aktywne ADMIN-y (poza `last`), żeby był ostatni.
    const closed = await mods!.db.roleAssignment.updateMany({
      where: { role: "ADMIN", validTo: null, userId: { not: last.userId } },
      data: { validTo: new Date() },
    });
    try {
      const me = await asActor(other.userId); // admin z zamkniętą rolą, ale aktor liczony z grantów
      const lastAdmin = await mods!.db.roleAssignment.findFirstOrThrow({
        where: { userId: last.userId, role: "ADMIN" },
      });
      await expect(
        mods!.rbac.revokeRole(mods!.rbac.SYSTEM_ACTOR, { assignmentId: lastAdmin.id }),
      ).rejects.toThrow(/ostatni/);
      await expect(
        mods!.accounts.deactivateAccount(mods!.rbac.SYSTEM_ACTOR, last.userId),
      ).rejects.toThrow(/ostatni/);
      expect(me.grants).toEqual([]);
    } finally {
      await mods!.db.roleAssignment.updateMany({
        where: { role: "ADMIN", userId: { not: last.userId }, validTo: { not: null } },
        data: { validTo: null },
      });
      expect(closed.count).toBeGreaterThan(0);
    }
    // Gdy jest drugi admin, odebranie przechodzi.
    const lastAdmin = await mods!.db.roleAssignment.findFirstOrThrow({
      where: { userId: last.userId, role: "ADMIN" },
    });
    await mods!.rbac.revokeRole(mods!.rbac.SYSTEM_ACTOR, { assignmentId: lastAdmin.id });
  });

  it("konto zarządu: admin bez MANAGEMENT nie resetuje hasła, nie blokuje; MANAGEMENT+ADMIN tak", async () => {
    const admin = await mk("admin5", [{ role: "ADMIN" }]);
    const boss = await mk("boss2", [{ role: "ADMIN" }, { role: "MANAGEMENT" }]);
    const mgmt = await mk("zarzad", [{ role: "MANAGEMENT" }]);
    const a = await asActor(admin.userId);
    const b = await asActor(boss.userId);

    await expect(mods!.accounts.resetPassword(a, mgmt.userId)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    await expect(mods!.accounts.deactivateAccount(a, mgmt.userId)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );

    await expect(mods!.accounts.resetPassword(b, mgmt.userId)).resolves.toHaveProperty(
      "temporaryPassword",
    );
    await mods!.accounts.deactivateAccount(b, mgmt.userId, "test");
    await expect(mods!.accounts.activateAccount(a, mgmt.userId)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    await mods!.accounts.activateAccount(b, mgmt.userId);
  });
});
