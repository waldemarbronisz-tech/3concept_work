/** Warianty lampki statusu (docs/UI_STYLE.md §4). */
export type StatusVariant = "neutral" | "run" | "done" | "warn" | "alarm";

/**
 * Stany pakietu wg docs/PLAN_MVP.md (enum WorkPackageStatus). Typ trafi do
 * modułu work-packages, gdy powstanie (iteracja 11).
 */
export type WorkPackageStatus =
  "PLANNED" | "READY" | "IN_PROGRESS" | "BLOCKED" | "TO_ACCEPT" | "ACCEPTED" | "CLOSED" | "REWORK";

/**
 * Waga przyczyny blokady (pole `severity` kategorii przyczyny, decyzja D6).
 * `neutral` = „wstrzymany” — ten sam status `BLOCKED`, bez alarmu.
 */
export type BlockSeverity = "alarm" | "neutral";

const VARIANT: Record<WorkPackageStatus, StatusVariant> = {
  PLANNED: "neutral",
  READY: "neutral",
  IN_PROGRESS: "run",
  BLOCKED: "alarm",
  TO_ACCEPT: "neutral",
  ACCEPTED: "done",
  CLOSED: "neutral",
  REWORK: "warn",
};

const LABEL: Record<WorkPackageStatus, string> = {
  PLANNED: "Planowany",
  READY: "Gotowy",
  IN_PROGRESS: "W toku",
  BLOCKED: "Zablokowany",
  TO_ACCEPT: "Do odbioru",
  ACCEPTED: "Odebrany",
  CLOSED: "Zamknięty",
  REWORK: "Wymaga poprawek",
};

/** Stany, w których przekroczenie planu rbh wymaga jeszcze reakcji. */
const ACTIVE: ReadonlySet<WorkPackageStatus> = new Set(["IN_PROGRESS", "TO_ACCEPT", "REWORK"]);

export interface StatusView {
  variant: StatusVariant;
  label: string;
}

export interface PackageStatusContext {
  /** Przepracowane rbh. */
  actualHours?: number;
  /** Planowane rbh; 0 = pakiet bez planu. */
  plannedHours?: number;
  /** Waga przyczyny blokady; tylko dla `BLOCKED`, domyślnie `alarm`. */
  blockSeverity?: BlockSeverity;
}

/** Stan pakietu → lampka i tekst (tabela w docs/UI_STYLE.md §4). */
export function packageStatusView(
  status: WorkPackageStatus,
  { actualHours = 0, plannedHours, blockSeverity = "alarm" }: PackageStatusContext = {},
): StatusView {
  const label = LABEL[status];

  if (status === "BLOCKED") {
    return blockSeverity === "neutral"
      ? { variant: "neutral", label: "Wstrzymany" }
      : { variant: "alarm", label };
  }

  if (plannedHours !== undefined && plannedHours <= 0) {
    // Bez planu nie ma „ponad plan”; alarmuje tylko praca w toku.
    return status === "IN_PROGRESS"
      ? { variant: "warn", label: "Brak planu rbh · w toku" }
      : { variant: VARIANT[status], label };
  }

  if (plannedHours !== undefined && actualHours > plannedHours && ACTIVE.has(status)) {
    return { variant: "warn", label: `Ponad plan · ${label.toLowerCase()}` };
  }

  return { variant: VARIANT[status], label };
}
