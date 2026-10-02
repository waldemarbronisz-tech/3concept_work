import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Kontrast WCAG par kolorów z docs/UI_STYLE.md §3. Wartości tokenów są czytane
 * z globals.css (jedyne źródło), więc zmiana palety poniżej AA zatrzyma CI.
 */

const AA = 4.5;

const PAIRS: Array<[fg: string, bg: string]> = [
  ["ink", "surface"],
  ["ink-2", "surface"],
  ["surface", "primary"], // biały tekst na przycisku głównym
  ["primary", "primary-soft"],
  ["surface", "alarm"], // biały tekst na lampce „Zablokowany”
  ["alarm", "alarm-soft"],
  ["warn", "warn-soft"],
  ["warn", "surface"],
  ["ok", "surface"],
];

function readTokens(): Record<string, string> {
  const css = readFileSync(path.join(import.meta.dirname, "globals.css"), "utf8");
  const tokens: Record<string, string> = {};
  for (const [, name, value] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    tokens[name!] = value!.toLowerCase();
  }
  return tokens;
}

/** Luminancja względna wg WCAG 2.x. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

describe("tokeny kolorów (globals.css)", () => {
  const tokens = readTokens();

  it("zawiera wszystkie tokeny z par", () => {
    for (const pair of PAIRS) for (const name of pair) expect(tokens[name], name).toBeDefined();
  });

  it.each(PAIRS)("%s na %s ≥ 4,5:1 (WCAG AA)", (fg, bg) => {
    expect(contrastRatio(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(AA);
  });

  it("karmin marki nie jest tokenem UI (tylko brand-red)", () => {
    const uiTokens = Object.entries(tokens).filter(([name]) => !name.startsWith("brand-"));
    expect(uiTokens.some(([, value]) => value === tokens["brand-red"])).toBe(false);
  });
});
