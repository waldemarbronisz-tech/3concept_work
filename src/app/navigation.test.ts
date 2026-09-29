import { describe, expect, it } from "vitest";
import { BOTTOM_NAV, navigationFor, type NavProfile, type Role } from "./navigation";

describe("BOTTOM_NAV", () => {
  it.each<[NavProfile, string[]]>([
    ["worker", ["Kolejka", "Czas", "Pakiety", "Menu"]],
    ["foreman", ["Kolejka", "Ekipa", "Pakiety", "Menu"]],
    ["engineer", ["Kolejka", "Budowa", "Czas", "Menu"]],
    ["management", ["Kolejka", "Budowy", "Czas", "Menu"]],
  ])("%s: %j", (profile, labels) => {
    expect(BOTTOM_NAV[profile].map((item) => item.label)).toEqual(labels);
  });

  it("adresy w obrębie profilu są unikalne", () => {
    for (const items of Object.values(BOTTOM_NAV)) {
      expect(new Set(items.map((item) => item.href)).size).toBe(items.length);
    }
  });
});

describe("navigationFor", () => {
  const labels = (roles: Role[]) => {
    const nav = navigationFor(roles);
    return {
      profile: nav.profile,
      bottomNav: nav.bottomNav.map((item) => item.label),
      menu: nav.menu.map((item) => item.label),
    };
  };

  it("[WORKER] → pracownik", () => {
    expect(labels(["WORKER"])).toEqual({
      profile: "worker",
      bottomNav: ["Kolejka", "Czas", "Pakiety", "Menu"],
      menu: [],
    });
  });

  it("[FOREMAN, WORKER] → brygadzista (najwyższa rola)", () => {
    expect(labels(["FOREMAN", "WORKER"])).toEqual({
      profile: "foreman",
      bottomNav: ["Kolejka", "Ekipa", "Pakiety", "Menu"],
      menu: [],
    });
  });

  it("[ADMIN] → kierownik/zarząd + Administracja w Menu", () => {
    expect(labels(["ADMIN"])).toEqual({
      profile: "management",
      bottomNav: ["Kolejka", "Budowy", "Czas", "Menu"],
      menu: ["Administracja"],
    });
  });

  it("[MANAGEMENT, ADMIN] → kierownik/zarząd + Administracja w Menu", () => {
    expect(labels(["MANAGEMENT", "ADMIN"])).toEqual({
      profile: "management",
      bottomNav: ["Kolejka", "Budowy", "Czas", "Menu"],
      menu: ["Administracja"],
    });
  });

  it("[] → brak nawigacji (profil none)", () => {
    expect(labels([])).toEqual({ profile: "none", bottomNav: [], menu: [] });
  });

  it("ADMIN nie zmienia paska innej roli", () => {
    expect(labels(["WORKER", "ADMIN"])).toMatchObject({
      profile: "worker",
      menu: ["Administracja"],
    });
  });

  it.each<[Role[], NavProfile]>([
    [["CONTRACT_MANAGER"], "management"],
    [["SITE_ENGINEER", "FOREMAN"], "engineer"],
    [["WORKER", "FOREMAN"], "foreman"],
    [["WORKER", "MANAGEMENT"], "management"],
  ])("%j → %s (kolejność ról bez znaczenia)", (roles, profile) => {
    expect(navigationFor(roles).profile).toBe(profile);
  });
});
