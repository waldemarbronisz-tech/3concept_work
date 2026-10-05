import { describe, expect, it } from "vitest";
import {
  canTransition,
  normalizeSiteNumber,
  parseDateOnly,
  SITE_NUMBER_PATTERN,
  toDateOnly,
} from "./domain";

describe("numer budowy", () => {
  it("normalizuje odstępy", () => {
    expect(normalizeSiteNumber("  075  ")).toBe("075");
    expect(normalizeSiteNumber("SE  Olszyna")).toBe("SE Olszyna");
  });

  it.each(["075", "2026/12", "A-1", "SE Olszyna.075"])("akceptuje %s", (v) => {
    expect(SITE_NUMBER_PATTERN.test(v)).toBe(true);
  });

  it.each(["", "-075", "nr#1", "x".repeat(31)])("odrzuca %j", (v) => {
    expect(SITE_NUMBER_PATTERN.test(v)).toBe(false);
  });
});

describe("status budowy", () => {
  it("planowana → w realizacji → zakończona; zakończonej nie otwiera się", () => {
    expect(canTransition("PLANNED", "ACTIVE")).toBe(true);
    expect(canTransition("ACTIVE", "CLOSED")).toBe(true);
    expect(canTransition("CLOSED", "ACTIVE")).toBe(false);
    expect(canTransition("ACTIVE", "PLANNED")).toBe(false);
    expect(canTransition("ACTIVE", "ACTIVE")).toBe(true);
  });
});

describe("daty", () => {
  it("parsuje i formatuje YYYY-MM-DD bez przesunięcia strefy", () => {
    const d = parseDateOnly("2026-10-05");
    expect(d?.toISOString()).toBe("2026-10-05T00:00:00.000Z");
    expect(toDateOnly(d)).toBe("2026-10-05");
    expect(parseDateOnly("")).toBeNull();
    expect(parseDateOnly("5.10.2026")).toBeNull();
  });
});
