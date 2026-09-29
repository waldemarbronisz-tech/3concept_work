import { describe, expect, it } from "vitest";
import { packageStatusView, type WorkPackageStatus } from "./package-status";

describe("packageStatusView", () => {
  it.each<[WorkPackageStatus, string, string]>([
    ["PLANNED", "neutral", "Planowany"],
    ["READY", "neutral", "Gotowy"],
    ["TO_ACCEPT", "neutral", "Do odbioru"],
    ["CLOSED", "neutral", "Zamknięty"],
    ["IN_PROGRESS", "run", "W toku"],
    ["ACCEPTED", "done", "Odebrany"],
    ["REWORK", "warn", "Wymaga poprawek"],
    ["BLOCKED", "alarm", "Zablokowany"],
  ])("%s → %s „%s”", (status, variant, label) => {
    expect(packageStatusView(status)).toEqual({ variant, label });
  });

  describe("ponad plan rbh", () => {
    const over = { actualHours: 118, plannedHours: 110 };

    it.each<[WorkPackageStatus, string]>([
      ["IN_PROGRESS", "Ponad plan · w toku"],
      ["TO_ACCEPT", "Ponad plan · do odbioru"],
      ["REWORK", "Ponad plan · wymaga poprawek"],
    ])("stan aktywny %s → warn", (status, label) => {
      expect(packageStatusView(status, over)).toEqual({ variant: "warn", label });
    });

    it.each<[WorkPackageStatus, string, string]>([
      ["ACCEPTED", "done", "Odebrany"],
      ["CLOSED", "neutral", "Zamknięty"],
      ["PLANNED", "neutral", "Planowany"],
      ["READY", "neutral", "Gotowy"],
    ])("stan nieaktywny %s zostaje %s", (status, variant, label) => {
      expect(packageStatusView(status, over)).toEqual({ variant, label });
    });

    it("nie przykrywa blokady", () => {
      expect(packageStatusView("BLOCKED", over)).toEqual({
        variant: "alarm",
        label: "Zablokowany",
      });
    });

    it("dokładnie w planie to jeszcze nie „ponad plan”", () => {
      expect(packageStatusView("IN_PROGRESS", { actualHours: 60, plannedHours: 60 })).toEqual({
        variant: "run",
        label: "W toku",
      });
    });
  });

  describe("plan = 0", () => {
    it("w toku → warn „Brak planu rbh”", () => {
      expect(packageStatusView("IN_PROGRESS", { actualHours: 4, plannedHours: 0 })).toEqual({
        variant: "warn",
        label: "Brak planu rbh · w toku",
      });
    });

    it.each<[WorkPackageStatus, string, string]>([
      ["PLANNED", "neutral", "Planowany"],
      ["TO_ACCEPT", "neutral", "Do odbioru"],
      ["ACCEPTED", "done", "Odebrany"],
      ["REWORK", "warn", "Wymaga poprawek"],
    ])("%s zostaje bazowy, bez „ponad plan”", (status, variant, label) => {
      expect(packageStatusView(status, { actualHours: 4, plannedHours: 0 })).toEqual({
        variant,
        label,
      });
    });
  });

  describe("wstrzymany (D6: BLOCKED + severity przyczyny)", () => {
    it("severity neutral → neutralne „Wstrzymany”", () => {
      expect(packageStatusView("BLOCKED", { blockSeverity: "neutral" })).toEqual({
        variant: "neutral",
        label: "Wstrzymany",
      });
    });

    it("severity alarm → „Zablokowany”", () => {
      expect(packageStatusView("BLOCKED", { blockSeverity: "alarm" })).toEqual({
        variant: "alarm",
        label: "Zablokowany",
      });
    });

    it("wstrzymany ponad planem nadal neutralny", () => {
      expect(
        packageStatusView("BLOCKED", {
          blockSeverity: "neutral",
          actualHours: 50,
          plannedHours: 40,
        }),
      ).toEqual({ variant: "neutral", label: "Wstrzymany" });
    });

    it("severity nie wpływa na inne stany", () => {
      expect(packageStatusView("IN_PROGRESS", { blockSeverity: "neutral" }).variant).toBe("run");
    });
  });
});
