import { describe, expect, it } from "vitest";
import { RBH_PLAN_MARK, rbhBarGeometry } from "./rbh";

describe("rbhBarGeometry", () => {
  it("kreska planu stoi na 80 % szerokości", () => {
    expect(RBH_PLAN_MARK).toBe(80);
  });

  it("0 % — pusty pasek", () => {
    expect(rbhBarGeometry(0, 45)).toEqual({
      percent: 0,
      fillWidth: 0,
      overWidth: 0,
      clipped: false,
      diff: -45,
    });
  });

  it("70 % — wypełnienie 56 % szerokości", () => {
    const g = rbhBarGeometry(42, 60);
    expect(g.percent).toBe(70);
    expect(g.fillWidth).toBeCloseTo(56);
    expect(g.overWidth).toBe(0);
    expect(g.diff).toBeCloseTo(-18);
  });

  it("100 % — wypełnienie dokładnie do kreski planu", () => {
    const g = rbhBarGeometry(60, 60);
    expect(g.percent).toBe(100);
    expect(g.fillWidth).toBeCloseTo(RBH_PLAN_MARK);
    expect(g.overWidth).toBe(0);
    expect(g.diff).toBe(0);
  });

  it("107 % — nadwyżka osobno za kreską planu", () => {
    const g = rbhBarGeometry(118, 110);
    expect(g.percent).toBe(107);
    expect(g.fillWidth).toBeCloseTo(RBH_PLAN_MARK);
    expect(g.overWidth).toBeCloseTo(5.82, 2);
    expect(g.clipped).toBe(false);
    expect(g.diff).toBeCloseTo(8);
  });

  it("> 125 % — nadwyżka obcięta do końca skali", () => {
    const g = rbhBarGeometry(90, 60);
    expect(g.percent).toBe(150);
    expect(g.fillWidth + g.overWidth).toBeCloseTo(100);
    expect(g.overWidth).toBeCloseTo(20);
    expect(g.clipped).toBe(true);
    expect(g.diff).toBeCloseTo(30);
  });

  it("plan = 0 bez pracy — brak procentu, pusty pasek", () => {
    expect(rbhBarGeometry(0, 0)).toEqual({
      percent: null,
      fillWidth: 0,
      overWidth: 0,
      clipped: false,
      diff: 0,
    });
  });

  it("plan = 0 z pracą — cała praca to nadwyżka", () => {
    const g = rbhBarGeometry(4, 0);
    expect(g.percent).toBeNull();
    expect(g.fillWidth).toBe(0);
    expect(g.overWidth).toBeCloseTo(20);
    expect(g.clipped).toBe(true);
    expect(g.diff).toBe(4);
  });
});
