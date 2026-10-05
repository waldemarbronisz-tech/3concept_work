/** Czysta logika modułu budów — bez Prismy, Nexta i core. */

/**
 * Numer budowy (§41): w becie dowolny tekst; walidacja formatu wg prawdziwych
 * numerów dojdzie z D4a. Normalizacja: bez spacji na końcach, jeden odstęp.
 */
export function normalizeSiteNumber(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export const SITE_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._/-]{0,29}$/;

export const SITE_STATUS_LABEL = {
  PLANNED: "Planowana",
  ACTIVE: "W realizacji",
  CLOSED: "Zakończona",
} as const;

export type SiteStatus = keyof typeof SITE_STATUS_LABEL;

/** Dozwolone przejścia statusu budowy; zakończonej nie otwiera się ponownie bez decyzji (brak przejścia). */
const TRANSITIONS: Record<SiteStatus, readonly SiteStatus[]> = {
  PLANNED: ["ACTIVE", "CLOSED"],
  ACTIVE: ["CLOSED"],
  CLOSED: [],
};

export function canTransition(from: SiteStatus, to: SiteStatus): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

/** Data w formacie `YYYY-MM-DD` (pole `<input type="date">`) → `Date` w UTC albo `null`. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export const toDateOnly = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");
