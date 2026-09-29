import { describe, expect, it } from "vitest";
import { BOTTOM_NAV, type NavProfile } from "./navigation";

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
