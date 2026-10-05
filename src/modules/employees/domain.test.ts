import { describe, expect, it } from "vitest";
import { asciiSlug, fullName, nextFreeUsername, suggestUsername } from "./domain";

describe("suggestUsername", () => {
  it.each([
    ["Jan", "Kowalski", "jkowalski"],
    ["Łukasz", "Żółć", "lzolc"],
    ["Anna Maria", "Wiśniewska-Nowak", "awisniewskanowak"],
    ["Ed", "Li", "eli"],
    ["A", "Bo", "abo"],
  ])("%s %s → %s", (first, last, expected) => {
    expect(suggestUsername(first, last)).toBe(expected);
  });

  it("nie przekracza 30 znaków", () => {
    expect(suggestUsername("A", "b".repeat(50))).toHaveLength(30);
  });
});

describe("nextFreeUsername", () => {
  it("zwraca bazę, gdy wolna", () => {
    expect(nextFreeUsername("jkowalski", new Set())).toBe("jkowalski");
  });

  it("dokłada kolejny numer", () => {
    expect(nextFreeUsername("jkowalski", new Set(["jkowalski", "jkowalski2"]))).toBe("jkowalski3");
  });
});

it("asciiSlug i fullName", () => {
  expect(asciiSlug("Zażółć gęślą jaźń!")).toBe("zazolcgeslajazn");
  expect(fullName({ firstName: "Jan", lastName: "Kowalski" })).toBe("Jan Kowalski");
});
