import { describe, expect, it } from "vitest";
import {
  authorize,
  can,
  canResetPassword,
  ForbiddenError,
  type AuthorizationActor,
} from "./authorize";
import { PERMISSIONS, type Permission } from "./permissions";
import { ROLES, type Role } from "./roles";

const actor = (...grants: Array<[Role, string | null]>): AuthorizationActor => ({
  userId: "u1",
  grants: grants.map(([role, siteId]) => ({ role, siteId })),
});

const admin = actor(["ADMIN", null]);
const management = actor(["MANAGEMENT", null]);
const managerA = actor(["CONTRACT_MANAGER", "A"]);
const engineerA = actor(["SITE_ENGINEER", "A"]);
const foremanA = actor(["FOREMAN", "A"]);
const worker = actor(["WORKER", null]);

describe("macierz uprawnień (PLAN_MVP §3)", () => {
  it("każda rola ma wpis", () => {
    for (const role of ROLES) expect(PERMISSIONS[role]).toBeDefined();
  });

  it("zarząd czyta wszystko, w tym koszty, i akceptuje na poziomie firmy", () => {
    expect(can(management, "sites.read", { siteId: "X" })).toBe(true);
    expect(can(management, "costs.read", { siteId: "X" })).toBe(true);
    expect(can(management, "approvals.company")).toBe(true);
    expect(can(management, "audit.readAll")).toBe(true);
  });

  it("zarząd nie zarządza kontami ani nie edytuje danych operacyjnych", () => {
    expect(can(management, "accounts.manage")).toBe(false);
    expect(can(management, "packages.manage", { siteId: "X" })).toBe(false);
  });

  it("admin: tylko konfiguracja, bez kosztów i danych operacyjnych (D10)", () => {
    expect(can(admin, "accounts.manage")).toBe(true);
    expect(can(admin, "dictionaries.manage")).toBe(true);
    expect(can(admin, "sites.list")).toBe(true);
    expect(can(admin, "audit.readSystem")).toBe(true);
    for (const p of ["costs.read", "sites.read", "packages.read", "time.read", "audit.readAll"]) {
      expect(can(admin, p as Permission, { siteId: "X" }), p).toBe(false);
    }
  });

  it("brygadzista nie widzi cudzej budowy", () => {
    expect(can(foremanA, "packages.read", { siteId: "A" })).toBe(true);
    expect(can(foremanA, "packages.read", { siteId: "B" })).toBe(false);
    expect(can(foremanA, "packages.read")).toBe(false);
  });

  it("brygadzista raportuje wykonanie, ale nie zarządza pakietami ani kosztami", () => {
    expect(can(foremanA, "packages.report", { siteId: "A" })).toBe(true);
    expect(can(foremanA, "packages.manage", { siteId: "A" })).toBe(false);
    expect(can(foremanA, "costs.read", { siteId: "A" })).toBe(false);
  });

  it("inżynier zarządza pakietami swojej budowy, bez kosztów", () => {
    expect(can(engineerA, "packages.manage", { siteId: "A" })).toBe(true);
    expect(can(engineerA, "packages.manage", { siteId: "B" })).toBe(false);
    expect(can(engineerA, "costs.read", { siteId: "A" })).toBe(false);
  });

  it("kierownik kontraktu ma koszty swoich budów", () => {
    expect(can(managerA, "costs.manage", { siteId: "A" })).toBe(true);
    expect(can(managerA, "costs.manage", { siteId: "B" })).toBe(false);
  });

  it("czas pracy (D3): każdy wpisuje własne godziny, nikt za innych", () => {
    for (const a of [worker, foremanA, engineerA, managerA]) {
      expect(can(a, "time.write", { ownerUserId: "u1" })).toBe(true);
      expect(can(a, "time.write", { ownerUserId: "u2", siteId: "A" })).toBe(false);
    }
    expect(can(management, "time.write", { ownerUserId: "u1" })).toBe(false);
  });

  it("brygadzista zatwierdza dzień ekipy na swojej budowie, nie na cudzej", () => {
    expect(can(foremanA, "time.approve", { siteId: "A" })).toBe(true);
    expect(can(foremanA, "time.approve", { siteId: "B" })).toBe(false);
    expect(can(foremanA, "time.manage", { siteId: "A" })).toBe(false); // korekta po zatwierdzeniu — nie
  });

  it("inżynier i kierownik zatwierdzają i korygują na swoich budowach; pracownik nie", () => {
    for (const a of [engineerA, managerA]) {
      expect(can(a, "time.approve", { siteId: "A" })).toBe(true);
      expect(can(a, "time.manage", { siteId: "A" })).toBe(true);
      expect(can(a, "time.approve", { siteId: "B" })).toBe(false);
    }
    expect(can(worker, "time.approve", { siteId: "A" })).toBe(false);
  });

  it("pracownik: tylko własne wpisy czasu i podstawowe dane pakietów", () => {
    expect(can(worker, "time.write", { ownerUserId: "u1" })).toBe(true);
    expect(can(worker, "time.write", { ownerUserId: "u2" })).toBe(false);
    expect(can(worker, "packages.readBasic", { ownerUserId: "u1" })).toBe(true);
    expect(can(worker, "packages.read", { siteId: "A" })).toBe(false);
    expect(can(worker, "costs.read")).toBe(false);
  });

  it("role się sumują (wiele ról na użytkownika)", () => {
    const both = actor(["WORKER", null], ["FOREMAN", "A"]);
    expect(can(both, "time.write", { ownerUserId: "u1" })).toBe(true);
    expect(can(both, "team.read", { siteId: "A" })).toBe(true);
    expect(can(both, "team.read", { siteId: "B" })).toBe(false);
  });

  it("rola z budową nie działa globalnie, rola globalna działa na każdej budowie", () => {
    expect(can(managerA, "sites.read")).toBe(false);
    expect(can(management, "sites.read", { siteId: "cokolwiek" })).toBe(true);
  });
});

describe("authorize", () => {
  it("przepuszcza uprawnionego", () => {
    expect(() => authorize(admin, "accounts.manage")).not.toThrow();
  });

  it("rzuca ForbiddenError z nazwą uprawnienia", () => {
    expect(() => authorize(worker, "accounts.manage")).toThrow(ForbiddenError);
    try {
      authorize(engineerA, "costs.read", { siteId: "A" });
    } catch (e) {
      expect((e as ForbiddenError).permission).toBe("costs.read");
    }
  });

  it("brak ról = brak dostępu", () => {
    expect(() => authorize(actor(), "sites.list")).toThrow(ForbiddenError);
  });
});

describe("canResetPassword (przypis ¹ macierzy)", () => {
  const target = (roles: Role[], siteIds: string[]) => ({ userId: "t", roles, siteIds });

  it("admin resetuje każdemu, także innemu adminowi i zarządowi", () => {
    expect(canResetPassword(admin, target(["ADMIN"], []))).toBe(true);
    expect(canResetPassword(admin, target(["MANAGEMENT"], []))).toBe(true);
    expect(canResetPassword(admin, target(["WORKER"], ["Z"]))).toBe(true);
  });

  it("kierownik resetuje pracownikowi, brygadziście i inżynierowi ze swojej budowy", () => {
    expect(canResetPassword(managerA, target(["WORKER"], ["A"]))).toBe(true);
    expect(canResetPassword(managerA, target(["FOREMAN", "WORKER"], ["A", "B"]))).toBe(true);
    expect(canResetPassword(managerA, target(["SITE_ENGINEER"], ["A"]))).toBe(true);
  });

  it("odmowa: pracownik spoza budów kierownika", () => {
    expect(canResetPassword(managerA, target(["WORKER"], ["B"]))).toBe(false);
    expect(canResetPassword(managerA, target(["WORKER"], []))).toBe(false);
  });

  it("odmowa: inny kierownik, nawet z tej samej budowy", () => {
    expect(canResetPassword(managerA, target(["CONTRACT_MANAGER"], ["A"]))).toBe(false);
  });

  it("odmowa: admin i zarząd", () => {
    expect(canResetPassword(managerA, target(["ADMIN"], ["A"]))).toBe(false);
    expect(canResetPassword(managerA, target(["MANAGEMENT"], ["A"]))).toBe(false);
  });

  it("odmowa: konto z jakąkolwiek rolą uprzywilejowaną obok zwykłej", () => {
    expect(canResetPassword(managerA, target(["WORKER", "CONTRACT_MANAGER"], ["A"]))).toBe(false);
  });

  it("odmowa: inżynier, brygadzista, pracownik i zarząd nie resetują nikomu", () => {
    for (const a of [engineerA, foremanA, worker, management]) {
      expect(canResetPassword(a, target(["WORKER"], ["A"]))).toBe(false);
    }
  });
});
