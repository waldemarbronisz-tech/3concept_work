import { afterAll, describe, expect, it } from "vitest";

// Integracyjne (pomijane bez DATABASE_URL_TEST): zakres budów, zespół, audyt.
const url = process.env.DATABASE_URL;
const mods = url
  ? {
      db: (await import("@/core/db")).db,
      rbac: await import("@/core/rbac"),
      grants: await import("@/core/rbac/grants"),
      accounts: await import("@/core/auth/accounts"),
      employees: await import("@/modules/employees/service"),
      service: await import("./service"),
    }
  : null;

describe.skipIf(!mods)("sites/service", () => {
  const prefix = `s${Date.now().toString(36)}`;
  const A = `${prefix}-A`;
  const B = `${prefix}-B`;
  const admin = () => mods!.rbac.SYSTEM_ACTOR;
  const management = { userId: "m", grants: [{ role: "MANAGEMENT" as const, siteId: null }] };
  const managerA = { userId: "ka", grants: [{ role: "CONTRACT_MANAGER" as const, siteId: A }] };
  const engineerA = { userId: "ia", grants: [{ role: "SITE_ENGINEER" as const, siteId: A }] };
  const foremanA = { userId: "ba", grants: [{ role: "FOREMAN" as const, siteId: A }] };
  const engineerB = { userId: "ib", grants: [{ role: "SITE_ENGINEER" as const, siteId: B }] };
  afterAll(() => mods!.db.$disconnect());

  const base = (siteNumber: string) => ({
    siteNumber,
    name: `Budowa ${siteNumber}`,
    client: "Klient",
    location: "Miasto",
    status: "PLANNED" as const,
    startDate: "2026-10-01",
    endDate: null,
    notes: null,
  });

  it("budowę zakłada admin; kierownik, zarząd i duplikat numeru — odmowa", async () => {
    const site = await mods!.service.createSite(admin(), base(A));
    expect(site.siteNumber).toBe(A);
    await mods!.service.createSite(admin(), base(B));
    await expect(mods!.service.createSite(managerA, base(`${prefix}-C`))).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    await expect(mods!.service.createSite(management, base(`${prefix}-D`))).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    await expect(mods!.service.createSite(admin(), base(A))).rejects.toThrow(/już istnieje/);
    const entry = await mods!.db.auditLog.findFirst({
      where: { action: "site.create", siteId: A },
    });
    expect(entry?.category).toBe("OPERATIONAL");
  });

  it("zakres listy: zarząd wszystkie, kierownik swoją, inżynier B nie widzi A, admin tylko opcje", async () => {
    const all = (await mods!.service.listSites(management)).map((s) => s.siteNumber);
    expect(all).toEqual(expect.arrayContaining([A, B]));
    expect((await mods!.service.listSites(managerA)).map((s) => s.siteNumber)).toEqual([A]);
    expect((await mods!.service.listSites(engineerB)).map((s) => s.siteNumber)).toEqual([B]);
    await expect(mods!.service.getSite(engineerB, A)).rejects.toThrow(mods!.rbac.ForbiddenError);
    expect((await mods!.service.listSiteOptions(admin())).some((s) => s.siteNumber === A)).toBe(
      true,
    );
    expect(await mods!.service.listSites({ userId: "nikt", grants: [] })).toEqual([]);
  });

  it("edycja przez kierownika z historią statusu; cofnięcie statusu i obca budowa — odmowa", async () => {
    await mods!.service.updateSite(managerA, A, { ...base(A), status: "ACTIVE" });
    await expect(
      mods!.service.updateSite(managerA, A, { ...base(A), status: "PLANNED" }),
    ).rejects.toThrow(/statusu/);
    await expect(
      mods!.service.updateSite(engineerB, A, { ...base(A), status: "ACTIVE" }),
    ).rejects.toThrow(mods!.rbac.ForbiddenError);
    const entry = await mods!.db.auditLog.findFirst({
      where: { action: "site.update", siteId: A },
      orderBy: { at: "desc" },
    });
    expect(entry?.before).toMatchObject({ status: "PLANNED" });
    expect(entry?.after).toMatchObject({ status: "ACTIVE" });
  });

  it("budżet rbh: kierownik tak (wpis FINANCIAL), inżynier nie; ukryty przed brygadzistą", async () => {
    await mods!.service.updateSiteBudget(managerA, A, { laborBudgetHours: "120.50" });
    await expect(
      mods!.service.updateSiteBudget(engineerA, A, { laborBudgetHours: "1" }),
    ).rejects.toThrow(mods!.rbac.ForbiddenError);
    const entry = await mods!.db.auditLog.findFirst({
      where: { action: "site.updateBudget", siteId: A },
    });
    expect(entry?.category).toBe("FINANCIAL");
    const site = (await mods!.service.getSite(foremanA, A))!;
    expect(mods!.service.withCostsVisibility(foremanA, site).laborBudgetHours).toBeNull();
    expect(mods!.service.withCostsVisibility(managerA, site).laborBudgetHours?.toString()).toBe(
      "120.5",
    );
  });

  it("zespół: inżynier dodaje i zdejmuje, brygadzista tylko czyta; członek widzi budowę jako `member`", async () => {
    const worker = await mods!.employees.createEmployee(admin(), {
      firstName: "Tadeusz",
      lastName: `Zespołowy${prefix}`,
      position: "monter",
      phone: null,
      employmentStatus: "ACTIVE",
      username: undefined,
      roles: ["WORKER"],
    });
    await expect(mods!.service.addTeamMember(foremanA, A, worker.employeeId)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    const member = await mods!.service.addTeamMember(engineerA, A, worker.employeeId);
    expect((await mods!.service.getTeam(foremanA, A)).some((m) => m.id === member.id)).toBe(true);

    // Pracownik z zespołu widzi A (zakres member), nie widzi B.
    const user = await mods!.db.user.findFirstOrThrow({
      where: { employee: { id: worker.employeeId } },
    });
    const workerActor = {
      userId: user.id,
      grants: await mods!.grants.loadGrants(user.id),
      memberSiteIds: await mods!.grants.loadMemberSiteIds(user.id),
    };
    expect(workerActor.memberSiteIds).toEqual([A]);
    expect((await mods!.service.listSites(workerActor)).map((s) => s.siteNumber)).toEqual([A]);
    await expect(mods!.service.getSite(workerActor, B)).rejects.toThrow(mods!.rbac.ForbiddenError);

    // Kierownik A może zresetować hasło członkowi zespołu (siteIds z członkostwa).
    await expect(mods!.accounts.resetPassword(managerA, user.id)).resolves.toHaveProperty(
      "temporaryPassword",
    );

    await expect(mods!.service.removeTeamMember(engineerB, A, member.id)).rejects.toThrow(
      mods!.rbac.ForbiddenError,
    );
    await mods!.service.removeTeamMember(engineerA, A, member.id);
    expect((await mods!.service.getTeam(engineerA, A)).some((m) => m.id === member.id)).toBe(false);
    expect(await mods!.grants.loadMemberSiteIds(user.id)).toEqual([]);
    const actions = await mods!.db.auditLog.findMany({
      where: { siteId: A, action: { in: ["team.add", "team.remove"] } },
    });
    expect(actions.map((a) => a.action).sort()).toEqual(["team.add", "team.remove"]);
  });
});
