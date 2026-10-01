import { afterAll, describe, expect, it } from "vitest";
import { AUDIT_ACTIONS } from "./record";

// Integracyjne (pomijane bez DATABASE_URL_TEST): wpisy audytu z operacji na kontach i rolach.
const url = process.env.DATABASE_URL;
const mods = url
  ? {
      db: (await import("@/core/db")).db,
      accounts: await import("@/core/auth/accounts"),
      rbac: await import("@/core/rbac"),
      audit: await import("./index"),
    }
  : null;

describe("kategorie akcji", () => {
  it("każda akcja ma kategorię", () => {
    for (const category of Object.values(AUDIT_ACTIONS)) {
      expect(["SYSTEM", "OPERATIONAL", "FINANCIAL"]).toContain(category);
    }
  });
});

describe.skipIf(!mods)("audit log", () => {
  const prefix = `a${Date.now().toString(36)}`;
  afterAll(() => mods!.db.$disconnect());

  const entriesFor = (userId: string) =>
    mods!.db.auditLog.findMany({ where: { entityId: userId }, orderBy: { at: "asc" } });

  it("założenie konta, reset hasła, blokada i role zostawiają ślad SYSTEM bez haseł", async () => {
    const { SYSTEM_ACTOR } = mods!.rbac;
    const { userId, temporaryPassword } = await mods!.accounts.createAccount(SYSTEM_ACTOR, {
      username: `${prefix}.audyt`,
      name: "Audyt Test",
      roles: [{ role: "WORKER" }],
    });
    const reset = await mods!.accounts.resetPassword(SYSTEM_ACTOR, userId);
    await mods!.accounts.deactivateAccount(SYSTEM_ACTOR, userId, "test blokady");
    await mods!.accounts.activateAccount(SYSTEM_ACTOR, userId);
    const grant = await mods!.rbac.grantRole(SYSTEM_ACTOR, {
      userId,
      role: "FOREMAN",
      siteId: "site-a",
    });
    await mods!.rbac.revokeRole(SYSTEM_ACTOR, { assignmentId: grant.id, reason: "koniec" });

    const entries = await entriesFor(userId);
    expect(entries.map((e) => e.action)).toEqual([
      "account.create",
      "account.resetPassword",
      "account.deactivate",
      "account.activate",
      "role.grant",
      "role.revoke",
    ]);
    expect(entries.every((e) => e.category === "SYSTEM")).toBe(true);
    expect(entries.every((e) => e.actorUserId === "system")).toBe(true);
    expect(entries[2]?.reason).toBe("test blokady");
    expect(entries[4]?.siteId).toBe("site-a");

    const serialized = JSON.stringify(entries);
    expect(serialized).not.toContain(temporaryPassword);
    expect(serialized).not.toContain(reset.temporaryPassword);
  });

  it("zapis audytu idzie w tej samej transakcji co zmiana (brak wpisu, gdy zmiana się nie uda)", async () => {
    const { SYSTEM_ACTOR } = mods!.rbac;
    const before = await mods!.db.auditLog.count({ where: { action: "account.deactivate" } });
    await expect(
      mods!.accounts.deactivateAccount(SYSTEM_ACTOR, "nie-ma-takiego-usera"),
    ).rejects.toThrow();
    expect(await mods!.db.auditLog.count({ where: { action: "account.deactivate" } })).toBe(before);
  });

  it("nadanie tej samej roli drugi raz nie dubluje przypisania ani wpisu", async () => {
    const { SYSTEM_ACTOR } = mods!.rbac;
    const { userId } = await mods!.accounts.createAccount(SYSTEM_ACTOR, {
      username: `${prefix}.dubel`,
      name: "Dubel",
    });
    const a = await mods!.rbac.grantRole(SYSTEM_ACTOR, { userId, role: "ADMIN" });
    const b = await mods!.rbac.grantRole(SYSTEM_ACTOR, { userId, role: "ADMIN" });
    expect(b.id).toBe(a.id);
    expect(
      await mods!.db.auditLog.count({ where: { entityId: userId, action: "role.grant" } }),
    ).toBe(1);
    await expect(
      mods!.rbac.grantRole(SYSTEM_ACTOR, { userId, role: "ADMIN", siteId: "site-a" }),
    ).rejects.toThrow(/globalna/);
  });

  describe("odczyt wg macierzy (przypis ²)", () => {
    const actor = (
      role: "MANAGEMENT" | "ADMIN" | "CONTRACT_MANAGER" | "SITE_ENGINEER" | "WORKER",
      siteId: string | null,
    ) => ({
      userId: `${prefix}-${role}`,
      grants: [{ role, siteId }],
    });

    it("zarząd czyta wszystko, admin tylko SYSTEM, pracownik nic", async () => {
      await mods!.db.auditLog.create({
        data: {
          actorUserId: "test",
          action: "cost.update",
          category: "FINANCIAL",
          entityType: "site",
          entityId: `${prefix}-site`,
          siteId: `${prefix}-site`,
        },
      });
      const all = await mods!.audit.listAuditLog(actor("MANAGEMENT", null), { limit: 500 });
      expect(all.some((e) => e.category === "FINANCIAL")).toBe(true);
      const sys = await mods!.audit.listAuditLog(actor("ADMIN", null), { limit: 500 });
      expect(sys.length).toBeGreaterThan(0);
      expect(sys.every((e) => e.category === "SYSTEM")).toBe(true);
      await expect(mods!.audit.listAuditLog(actor("WORKER", null))).rejects.toThrow(
        mods!.rbac.ForbiddenError,
      );
    });

    it("historia rekordu: kierownik widzi koszty swojej budowy, inżynier nie, cudza budowa — odmowa", async () => {
      const site = `${prefix}-site`;
      const record = { entityType: "site", entityId: site, siteId: site };
      const manager = await mods!.audit.recordHistory(actor("CONTRACT_MANAGER", site), record);
      expect(manager.some((e) => e.category === "FINANCIAL")).toBe(true);
      const engineer = await mods!.audit.recordHistory(actor("SITE_ENGINEER", site), record);
      expect(engineer.some((e) => e.category === "FINANCIAL")).toBe(false);
      await expect(
        mods!.audit.recordHistory(actor("SITE_ENGINEER", "inna-budowa"), record),
      ).rejects.toThrow(mods!.rbac.ForbiddenError);
    });
  });
});
