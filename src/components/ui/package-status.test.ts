import { describe, expect, it } from "vitest";
import { packageStatusView, type WorkPackageStatus } from "./package-status";

describe("packageStatusView", () => {
  it.each<[WorkPackageStatus, string]>([
    ["PLANNED", "neutral"],
    ["READY", "neutral"],
    ["TO_ACCEPT", "neutral"],
    ["CLOSED", "neutral"],
    ["IN_PROGRESS", "run"],
    ["ACCEPTED", "done"],
    ["REWORK", "warn"],
    ["BLOCKED", "alarm"],
  ])("%s → %s", (status, variant) => {
    expect(packageStatusView(status).variant).toBe(variant);
  });

  it("zawsze zwraca tekst, nie tylko kolor", () => {
    expect(packageStatusView("IN_PROGRESS").label).toBe("W toku");
  });

  it("ponad plan podnosi stan do ostrzeżenia i mówi o tym w tekście", () => {
    expect(packageStatusView("TO_ACCEPT", { overPlan: true })).toEqual({
      variant: "warn",
      label: "Ponad plan · do odbioru",
    });
  });

  it("ponad plan nie przykrywa blokady", () => {
    expect(packageStatusView("BLOCKED", { overPlan: true })).toEqual({
      variant: "alarm",
      label: "Zablokowany",
    });
  });
});
