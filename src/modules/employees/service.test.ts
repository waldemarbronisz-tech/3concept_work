import { afterAll, describe, expect, it } from "vitest";

// Integracyjne (pomijane bez DATABASE_URL_TEST): serwis pracowników z autoryzacją i audytem.
const url = process.env.DATABASE_URL;
const mods = url
  ? {
      db: (await import("@/core/db")).db,
      rbac: await import("@/core/rbac"),
      service: await import("./service"),
    }
  : null;

describe.skipIf(!mods)("employees/service", () => {
  const prefix = `e${Date.now().toString(36)}`;
  const admin = () => mods!.rbac.SYSTEM_ACTOR;
  const manager = { userId: "kier", grants: [{ role: "CONTRACT_MANAGER" as const, siteId: "A" }] };
  const worker = { userId: "prac", grants: [{ role: "WORKER" as const, siteId: null }] };
  afterAll(() => mods!.db.$disconnect());

  it("admin zakłada pracownika z kontem, loginem z nazwiska, rolą i śladem audytu", async () => {
    const created = await mods!.service.createEmployee(admin(), {
      firstName: "Zofia",
      lastName: `Testowa${prefix}`,
      position: "elektromonter",
      phone: null,
      employmentStatus: "ACTIVE",
      username: undefined,
      roles: ["WORKER"],
    });
    expect(created.username).toBe(`ztestowa${prefix}`);
    expect(created.temporaryPassword).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);

    const row = await mods!.service.getEmployee(admin(), created.employeeId);
    expect(row?.user.username).toBe(created.username);
    expect(row?.user.roleAssignments.map((r) => r.role)).toEqual(["WORKER"]);
    expect(row?.user.mustChangePassword).toBe(true);

    const actions = await mods!.db.auditLog.findMany({
      where: { OR: [{ entityId: created.employeeId }, { entityId: row!.user.id }] },
      orderBy: { at: "asc" },
    });
    expect(actions.map((a) => a.action)).toEqual(["account.create", "employee.create"]);
  });

  it("zajęty login dostaje numer, a podany ręcznie zajęty — odmowę", async () => {
    const second = await mods!.service.createEmployee(admin(), {
      firstName: "Zenon",
      lastName: `Testowa${prefix}`,
      position: "monter",
      phone: null,
      employmentStatus: "ACTIVE",
      username: undefined,
    });
    expect(second.username).toBe(`ztestowa${prefix}2`);
    await expect(
      mods!.service.createEmployee(admin(), {
        firstName: "Inny",
        lastName: "Inny",
        position: "monter",
        phone: null,
        employmentStatus: "ACTIVE",
        username: `ztestowa${prefix}`,
      }),
    ).rejects.toThrow(/zajęty/);
  });

  it("kierownik i pracownik nie zakładają kont ani nie widzą listy", async () => {
    for (const actor of [manager, worker]) {
      await expect(
        mods!.service.createEmployee(actor, {
          firstName: "X",
          lastName: "Y",
          position: "z",
          phone: null,
          employmentStatus: "ACTIVE",
          username: undefined,
        }),
      ).rejects.toThrow(mods!.rbac.ForbiddenError);
      await expect(mods!.service.listEmployees(actor, "all")).rejects.toThrow(
        mods!.rbac.ForbiddenError,
      );
    }
  });

  it("edycja zmienia dane, nazwę konta i zostawia before/after w audycie", async () => {
    const all = await mods!.service.listEmployees(admin(), "all");
    const emp = all.find((e) => e.user.username === `ztestowa${prefix}`)!;
    await mods!.service.updateEmployee(admin(), emp.id, {
      firstName: "Zofia",
      lastName: `Nowa${prefix}`,
      position: "brygadzista",
      phone: "600100200",
      employmentStatus: "ACTIVE",
    });
    const user = await mods!.db.user.findUniqueOrThrow({ where: { id: emp.user.id } });
    expect(user.name).toBe(`Zofia Nowa${prefix}`);
    const entry = await mods!.db.auditLog.findFirst({
      where: { entityId: emp.id, action: "employee.update" },
    });
    expect(entry?.before).toMatchObject({ position: "elektromonter" });
    expect(entry?.after).toMatchObject({ position: "brygadzista", phone: "600100200" });
  });

  it("role: nadanie i odebranie tylko własnych przypisań; blokada filtruje listę", async () => {
    const all = await mods!.service.listEmployees(admin(), "all");
    const emp = all.find((e) => e.user.username === `ztestowa${prefix}`)!;
    const other = all.find((e) => e.user.username === `ztestowa${prefix}2`)!;

    const grant = await mods!.service.grantEmployeeRole(admin(), emp.id, "ADMIN");
    await expect(mods!.service.revokeEmployeeRole(admin(), other.id, grant.id)).rejects.toThrow(
      /nie należy/,
    );
    await mods!.service.revokeEmployeeRole(admin(), emp.id, grant.id);
    const after = await mods!.service.getEmployee(admin(), emp.id);
    expect(after?.user.roleAssignments.map((r) => r.role)).toEqual(["WORKER"]);

    await mods!.service.blockEmployee(admin(), emp.id, "test");
    const blocked = await mods!.service.listEmployees(admin(), "blocked");
    expect(blocked.some((e) => e.id === emp.id)).toBe(true);
    const active = await mods!.service.listEmployees(admin(), "active");
    expect(active.some((e) => e.id === emp.id)).toBe(false);
    await mods!.service.unblockEmployee(admin(), emp.id);
  });

  it("reset hasła przez kierownika spoza budowy pracownika — odmowa; przez admina — nowe hasło", async () => {
    const all = await mods!.service.listEmployees(admin(), "all");
    const emp = all.find((e) => e.user.username === `ztestowa${prefix}`)!;
    await expect(mods!.service.resetEmployeePassword(manager, emp.id)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    const { temporaryPassword } = await mods!.service.resetEmployeePassword(admin(), emp.id);
    expect(temporaryPassword).toMatch(/-/);
  });
});
