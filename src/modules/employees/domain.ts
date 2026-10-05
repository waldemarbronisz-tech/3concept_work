/**
 * Czysta logika modułu pracowników — bez Prismy, Nexta i core (reguła ESLint).
 */

/** Imię i nazwisko do wyświetlenia. */
export const fullName = (e: { firstName: string; lastName: string }) =>
  `${e.firstName} ${e.lastName}`.trim();

/** Polskie znaki → ASCII, reszta poza [a-z0-9] wycięta. */
export function asciiSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Propozycja loginu: pierwsza litera imienia + nazwisko, np. „Jan Kowalski” → `jkowalski`.
 * Zgodna z USERNAME_PATTERN (3–30 znaków); krótkie nazwiska dopełniane imieniem.
 */
export function suggestUsername(firstName: string, lastName: string): string {
  const first = asciiSlug(firstName);
  const last = asciiSlug(lastName);
  let candidate = `${first.charAt(0)}${last}`;
  if (candidate.length < 3) candidate = `${first}${last}`;
  return candidate.slice(0, 30);
}

/** Kolejny wolny login, gdy propozycja jest zajęta: `jkowalski`, `jkowalski2`, `jkowalski3`… */
export function nextFreeUsername(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base.slice(0, 30 - String(n).length)}${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`Brak wolnego loginu dla „${base}”.`);
}
